import { RunService } from "@rbxts/services";

import {
	ActionDataByName,
	AnyActionData,
	SchedulerConfig,
	SystemCallbackType,
	actionQueue,
	getActionDataByName,
	getScheduler,
	predictableActions,
	registerSystems,
	sortPlayerActions,
} from "shared/ecs";
import { playerId } from "shared/ecs/action";
import {
	SerializableActions,
	SerializableEntities,
	SerializableServerSnapshot,
	clientSnapshotSerializer,
	serverSnapshotSerializer,
} from "shared/ecs/serializers";
import { applySerializableEntities, getSerializableEntities } from "shared/ecs/snapshot";

import { clientEvents } from "./network";

export interface ClientSchedulerConfig extends SchedulerConfig {
	flushInput: () => void;
}

interface ServerSnapshot {
	readonly frame: number;
	readonly entities: SerializableEntities;
	readonly actions: ActionDataByName;
}

export function startScheduler(config: ClientSchedulerConfig) {
	const scheduler = getScheduler();
	const registeredSystems = registerSystems(scheduler, config.systems);
	const timeStep = config.fixedTimeStep;
	const maxTimeStep = config.maxTimeStep;
	const flushInput = config.flushInput;

	const flushInputId = scheduler.register_system({
		name: "flush-input",
		phase: "fixedUpdate",
	});
	const rollbackId = scheduler.register_system({
		name: "rollback",
		phase: "fixedUpdate",
	});
	const deserializeId = scheduler.register_system({
		name: "deserialize",
		phase: "fixedUpdate",
	});
	const serializeId = scheduler.register_system({
		name: "serialize",
		phase: "fixedUpdate",
	});
	const predictId = scheduler.register_system({
		name: "predict",
		phase: "fixedUpdate",
	});

	const pendingSnapshots = new Array<SerializableServerSnapshot>();
	const localActionHistory = new Array<AnyActionData[]>();

	let lastSnapshot: ServerSnapshot | undefined;
	let lastActions: SerializableActions | undefined;
	let replicationStarted = false;

	let serverFrame = 0;
	let serverFrameDelay = 0;
	let clientFrame = 0;
	let accumulator = 0;
	let blendFactor = 0;

	function rollback() {
		const numSnapshots = pendingSnapshots.size();

		if (numSnapshots > 0) {
			// rollback to last snapshot if it exists
			if (lastSnapshot) {
				const lastFrame = lastSnapshot.frame;

				// update entity/component data
				applySerializableEntities(lastSnapshot.entities, false);

				// replay actions
				for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
					scheduler.run(system.id, system.callback, timeStep, lastFrame, lastSnapshot.actions);
			}

			// play received snapshots
			for (let snapshotIdx = 0; snapshotIdx < numSnapshots; snapshotIdx++) {
				const snapshot = pendingSnapshots[snapshotIdx];
				const snapshotFrame = snapshot.frame;
				const snapshotEntities = snapshot.entities;
				const snapshotActions = snapshot.actions;
				const actionDataByName = getActionDataByName(snapshotActions);

				if (snapshotIdx === numSnapshots - 1) {
					// latest server snapshot

					const entities = snapshotEntities ?? getSerializableEntities();

					lastSnapshot = {
						frame: snapshotFrame,
						entities,
						actions: actionDataByName,
					};

					lastActions = snapshotActions;
					serverFrame = snapshotFrame;
					serverFrameDelay = snapshot.frameDelay;

					if (!replicationStarted) {
						replicationStarted = true;
						clientFrame = serverFrame;
					}
				}

				// update entity/component data if necessary
				if (snapshotEntities) applySerializableEntities(snapshotEntities, true);

				// play actions
				for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
					scheduler.run(system.id, system.callback, timeStep, snapshotFrame, actionDataByName);
			}

			pendingSnapshots.clear();

			for (let i = 0; i < numSnapshots; i++) localActionHistory.pop();
		}
	}

	function sendSnapshot(frame: number, actions: Array<AnyActionData>) {
		const clientSnapshot = clientSnapshotSerializer.serialize({
			frame,
			actions,
		});

		clientEvents.clientSnapshot.fire(clientSnapshot.buffer);
	}

	function predictActions(actions: SerializableActions) {
		if (lastActions)
			for (const playerActions of lastActions) {
				const pid = playerActions.playerId;

				if (pid !== playerId) {
					const predictedPlayerActions = new Array<AnyActionData>();

					for (const actionData of playerActions.actions)
						if (predictableActions.has(actionData.name)) predictedPlayerActions.push(actionData);

					actions.push({
						playerId: pid,
						actions: predictedPlayerActions,
					});
				}
			}

		actions.sort(sortPlayerActions);

		lastActions = actions;
	}

	function onHeartbeat(deltaTime: number) {
		const prevServerFrame = serverFrame;

		deltaTime = math.min(deltaTime, maxTimeStep);
		accumulator += deltaTime;

		const prevClientFrame = clientFrame;
		const frameSteps = math.floor(accumulator / timeStep);

		if (frameSteps > 0) {
			scheduler.run(rollbackId, rollback);

			accumulator -= frameSteps * timeStep;
			clientFrame += frameSteps;
		}

		const targetFrame = serverFrame + serverFrameDelay;
		const prevFrame = prevServerFrame !== serverFrame ? serverFrame : prevClientFrame;

		if (targetFrame > clientFrame) {
			// if the client is behind, skip ahead 1 frame
			clientFrame++;
		}

		for (let frame = prevFrame + 1; frame <= clientFrame; frame++) {
			const actions = {} as SerializableActions;

			let currentLocalActions: AnyActionData[];

			// get client's actions to play this frame
			if (frame > prevClientFrame) {
				// new frame

				if (frame === clientFrame) {
					// current frame

					scheduler.run(flushInputId, flushInput);

					currentLocalActions = table.clone(actionQueue);
					actionQueue.clear();

					scheduler.run(serializeId, sendSnapshot, frame, currentLocalActions);
				} else {
					// skipped frame

					currentLocalActions = [];
				}

				// add local actions to history
				localActionHistory.insert(0, currentLocalActions);
			} else {
				// old frame, get old local actions from history
				currentLocalActions = localActionHistory[prevClientFrame - frame];
			}

			// add client's actions to the frame's actions
			actions.push({
				playerId,
				actions: currentLocalActions,
			});

			// predict actions
			scheduler.run(predictId, predictActions, actions);

			const actionDataByName = getActionDataByName(actions);

			for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
				scheduler.run(system.id, system.callback, timeStep, frame, actionDataByName);
		}

		blendFactor = accumulator / timeStep;

		for (const system of registeredSystems[SystemCallbackType.OnUpdate])
			scheduler.run(system.id, system.callback, deltaTime, clientFrame, blendFactor);
	}

	function onPreSimulation(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnPhysics])
			scheduler.run(system.id, system.callback, deltaTime, clientFrame, blendFactor);
	}

	function onPreRender(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnRender])
			scheduler.run(system.id, system.callback, deltaTime, clientFrame, blendFactor);
	}

	function onServerSnapshot(buf: buffer) {
		const snapshot = serverSnapshotSerializer.deserialize(buf);

		pendingSnapshots.push(snapshot);
	}

	RunService.Heartbeat.Connect(onHeartbeat);
	RunService.PreSimulation.Connect(onPreSimulation);
	RunService.PreRender.Connect(onPreRender);

	clientEvents.serverSnapshot.connect((buf) => scheduler.run(deserializeId, onServerSnapshot, buf));

	clientEvents.start.fire();
}
