import { Players, RunService } from "@rbxts/services";

import {
	AnyActionData,
	SchedulerConfig,
	SystemCallbackType,
	actionQueue,
	getActionDataByName,
	getScheduler,
	registerSystems,
	sortPlayerActions,
} from "shared/ecs";
import { playerId } from "shared/ecs/action";
import {
	SerializableActions,
	SerializableEntity,
	SerializablePlayerActions,
	SerializableServerSnapshot,
	clientSnapshotSerializer,
	serverSnapshotSerializer,
} from "shared/ecs/serializers";
import { getSerializableEntities } from "shared/ecs/snapshot";

import { serverEvents } from "./network";

interface PendingSnapshot {
	readonly pid: string;
	readonly buffer: buffer;
}

interface PendingFrame {
	readonly frame: number;
	readonly players: Array<Player>;
	readonly actions: Map<string, SerializablePlayerActions>;
}

export function startScheduler(config: SchedulerConfig) {
	const scheduler = getScheduler();
	const registeredSystems = registerSystems(scheduler, config.systems);
	const timeStep = config.fixedTimeStep;
	const maxTimeStep = config.maxTimeStep;

	const deserializeId = scheduler.register_system({
		name: "deserialize",
		phase: "fixedUpdate",
	});
	const serializeId = scheduler.register_system({
		name: "serialize",
		phase: "fixedUpdate",
	});
	const prepareId = scheduler.register_system({
		name: "prepare",
		phase: "fixedUpdate",
	});

	const maxFrameDelay = math.floor(maxTimeStep / timeStep);
	const pendingSnapshots = new Array<PendingSnapshot>();
	const pendingFrames = new Array<PendingFrame>();
	const resyncPlayers = new Array<Player>();
	const players = new Array<Player>();

	let serverFrame = 0;
	let accumulator = 0;
	let blendFactor = 0;

	let nextSnapshotFrame = 0;
	let nextSnapshotActions = new Array<SerializablePlayerActions>();
	let nextSnapshotEntities = new Array<SerializableEntity>();

	function prepareSnapshot(frame: number, actions: SerializableActions) {
		nextSnapshotFrame = frame;
		nextSnapshotActions = actions;

		if (resyncPlayers.size() > 0) nextSnapshotEntities = getSerializableEntities();
	}

	function sendSnapshot() {
		const frameDelay = serverFrame - nextSnapshotFrame;
		const numPlayers = players.size();

		if (numPlayers > 0) {
			const serverSnapshot: SerializableServerSnapshot = {
				frame: nextSnapshotFrame,
				frameDelay,
				actions: nextSnapshotActions,
			};
			const serialized = serverSnapshotSerializer.serialize(serverSnapshot);

			serverEvents.serverSnapshot.fire(players, serialized.buffer);
		}

		if (resyncPlayers.size() > 0) {
			const serverSnapshotWithEntities: SerializableServerSnapshot = {
				frame: nextSnapshotFrame,
				frameDelay,
				actions: nextSnapshotActions,
				entities: nextSnapshotEntities,
			};
			const serialized = serverSnapshotSerializer.serialize(serverSnapshotWithEntities);
			serverEvents.serverSnapshot.fire(resyncPlayers, serialized.buffer);

			resyncPlayers.move(0, resyncPlayers.size() - 1, numPlayers, players);
			resyncPlayers.clear();
		}
	}

	function processSnapshots() {
		for (const pendingSnapshot of pendingSnapshots) {
			const pid = pendingSnapshot.pid;
			const snapshot = clientSnapshotSerializer.deserialize(pendingSnapshot.buffer);
			const snapshotFrame = snapshot.frame;

			for (const pendingSnapshot of pendingFrames) {
				if (snapshotFrame !== pendingSnapshot.frame) continue;

				pendingSnapshot.actions.set(pid, {
					playerId: pid,
					actions: snapshot.actions,
				});

				break;
			}
		}

		table.clear(pendingSnapshots);
	}

	function onHeartbeat(deltaTime: number) {
		const framePrevious = serverFrame;

		let frameSteps = 0;

		deltaTime = math.min(deltaTime, maxTimeStep);
		accumulator += deltaTime;

		if (accumulator > 0) {
			frameSteps = math.floor(accumulator / timeStep);
			serverFrame += frameSteps;
			accumulator -= frameSteps * timeStep;
		}

		for (let frameStep = 1; frameStep <= frameSteps; frameStep++) {
			const frameCurrent = framePrevious + frameStep;
			const frameDelayed = frameCurrent - maxFrameDelay;
			const localActions = new Array<AnyActionData>();
			const pendingActions = new Map<string, SerializablePlayerActions>();

			if (frameStep === frameSteps) {
				actionQueue.move(0, actionQueue.size() - 1, 0, localActions);
				actionQueue.clear();
			}

			pendingActions.set(playerId, {
				playerId,
				actions: localActions,
			});

			pendingFrames.push({
				frame: frameCurrent,
				players: players.move(0, players.size(), 0),
				actions: pendingActions,
			});

			let canProcess;
			do {
				const snapshot = pendingFrames[0];

				if (snapshot) {
					const snapshotActions = snapshot.actions;
					const snapshotFrame = snapshot.frame;
					const actions: SerializableActions = [];

					if (snapshotFrame === frameDelayed) {
						canProcess = true;

						// fill in missing actions
						for (const player of snapshot.players) {
							const pid = tostring(player.UserId);

							if (!snapshotActions.has(pid))
								snapshotActions.set(pid, {
									playerId: pid,
									actions: [],
								});
						}
					} else {
						canProcess = true;

						// check for missing actions
						for (const player of snapshot.players) {
							const pid = tostring(player.UserId);

							if (!snapshotActions.has(pid)) {
								canProcess = false;
								break;
							}
						}
					}

					if (canProcess) {
						pendingFrames.remove(0);

						for (const [_, serializableActions] of snapshotActions) actions.push(serializableActions);

						actions.sort(sortPlayerActions);

						scheduler.run(prepareId, prepareSnapshot, snapshotFrame, actions);

						const actionDataByName = getActionDataByName(actions);

						for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
							scheduler.run(system.id, system.callback, timeStep, snapshotFrame, actionDataByName);

						scheduler.run(serializeId, sendSnapshot);
					}
				} else canProcess = false;
			} while (canProcess);
		}

		scheduler.run(deserializeId, processSnapshots);

		blendFactor = accumulator / timeStep;

		for (const system of registeredSystems[SystemCallbackType.OnUpdate])
			scheduler.run(system.id, system.callback, deltaTime, serverFrame, blendFactor);
	}

	function onPreSimulation(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnPhysics])
			scheduler.run(system.id, system.callback, deltaTime, serverFrame, blendFactor);
	}

	function onPreRender(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnRender])
			scheduler.run(system.id, system.callback, deltaTime, serverFrame, blendFactor);
	}

	function onPlayerRemoving(player: Player) {
		const playerIdx = players.indexOf(player);
		const resyncIdx = resyncPlayers.indexOf(player);

		if (playerIdx > -1) players.remove(playerIdx);
		if (resyncIdx > -1) resyncPlayers.remove(resyncIdx);
	}

	function onStart(player: Player) {
		if (!resyncPlayers.includes(player)) {
			const idx = players.indexOf(player);

			if (idx > -1) players.remove(idx);

			resyncPlayers.push(player);
		}
	}

	function onClientSnapshot(player: Player, buf: buffer) {
		const pid = tostring(player.UserId);

		pendingSnapshots.push({
			pid,
			buffer: buf,
		});
	}

	RunService.Heartbeat.Connect(onHeartbeat);
	RunService.PreSimulation.Connect(onPreSimulation);
	RunService.PreRender.Connect(onPreRender);
	Players.PlayerRemoving.Connect(onPlayerRemoving);

	serverEvents.start.connect(onStart);
	serverEvents.clientSnapshot.connect(onClientSnapshot);
}
