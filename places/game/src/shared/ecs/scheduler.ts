import { RunService } from "@rbxts/services";

import jabby from "@rbxts/jabby";
import { Scheduler, SystemId } from "@rbxts/jabby/out/jabby/modules/types";

import { actionQueue } from "./action-queue";
import { System, SystemCallback, SystemCallbackType } from "./system";
import { world } from "./world";

const FIXED_DELTA = 1 / 10;
const MAX_DELTA = 1 / 5;

type RegisteredSystem<T extends SystemCallbackType> = {
	id: SystemId;
	callback: SystemCallback<T>;
};

function getSortedSystems(systems: System[], callbackType: SystemCallbackType) {
	const filteredSystems = new Array<System>();
	const dependencyGraph = new Map<System, Array<System>>();
	const inDegree = new Map<System, number>();
	const queue = new Array<System>();
	const sortedOrder = new Array<System>();

	// filter systems and build dependency graph
	for (const system of systems) {
		if (system.callbacks[callbackType] !== undefined) {
			filteredSystems.push(system);
			inDegree.set(system, 0);

			if (system.dependencies)
				for (const dependency of system.dependencies) {
					const dependents = dependencyGraph.get(dependency);

					if (dependents) dependents.push(system);
					else dependencyGraph.set(dependency, [system]);
				}
		}
	}

	// calculate in-degrees
	for (const system of filteredSystems)
		for (const dependent of dependencyGraph.get(system) || [])
			inDegree.set(dependent, (inDegree.get(dependent) ?? 0) + 1);

	// initialize the queue
	for (const [system, degree] of inDegree) if (degree === 0) queue.push(system);

	// process the queue
	while (queue.size() > 0) {
		const current = queue.shift()!;
		sortedOrder.push(current);

		for (const dependent of dependencyGraph.get(current) || []) {
			inDegree.set(dependent, (inDegree.get(dependent) ?? 0) - 1);
			if (inDegree.get(dependent) === 0 && filteredSystems.find((s) => s === dependent)) queue.push(dependent);
		}
	}

	// check for cyclic dependencies
	if (sortedOrder.size() !== filteredSystems.size()) throw "Cyclic dependency detected";

	return sortedOrder;
}

function registerSystems(scheduler: Scheduler, systems: System[]) {
	const fixedUpdateSystems = getSortedSystems(systems, SystemCallbackType.OnFixedUpdate);
	const updateSystems = getSortedSystems(systems, SystemCallbackType.OnUpdate);
	const physicsSystems = getSortedSystems(systems, SystemCallbackType.OnPhysics);
	const renderSystems = getSortedSystems(systems, SystemCallbackType.OnRender);

	const fixedUpdateRegistry = new Array<RegisteredSystem<SystemCallbackType.OnFixedUpdate>>();
	const updateRegistry = new Array<RegisteredSystem<SystemCallbackType.OnUpdate>>();
	const physicsRegistry = new Array<RegisteredSystem<SystemCallbackType.OnPhysics>>();
	const renderRegistry = new Array<RegisteredSystem<SystemCallbackType.OnRender>>();

	for (const system of fixedUpdateSystems) {
		const id = scheduler.register_system({
			name: system.name,
			phase: "fixedUpdate",
		});

		fixedUpdateRegistry.push({
			id,
			callback: system.callbacks[SystemCallbackType.OnFixedUpdate]!,
		});
	}

	for (const system of updateSystems) {
		const id = scheduler.register_system({
			name: system.name,
			phase: "update",
		});

		updateRegistry.push({
			id,
			callback: system.callbacks[SystemCallbackType.OnUpdate]!,
		});
	}

	for (const system of physicsSystems) {
		const id = scheduler.register_system({
			name: system.name,
			phase: "physics",
		});

		physicsRegistry.push({
			id,
			callback: system.callbacks[SystemCallbackType.OnPhysics]!,
		});
	}

	for (const system of renderSystems) {
		const id = scheduler.register_system({
			name: system.name,
			phase: "render",
		});

		renderRegistry.push({
			id,
			callback: system.callbacks[SystemCallbackType.OnRender]!,
		});
	}

	return {
		[SystemCallbackType.OnFixedUpdate]: fixedUpdateRegistry,
		[SystemCallbackType.OnUpdate]: updateRegistry,
		[SystemCallbackType.OnPhysics]: physicsRegistry,
		[SystemCallbackType.OnRender]: renderRegistry,
	};
}

export function startScheduler(systems: System[]) {
	const scheduler = jabby.scheduler.create();
	const registeredSystems = registerSystems(scheduler, systems);

	jabby.register({
		applet: jabby.applets.world,
		name: "all",
		configuration: {
			world,
		},
	});
	jabby.register({
		applet: jabby.applets.scheduler,
		name: "all",
		configuration: {
			scheduler,
		},
	});

	let frame = 0;
	let accumulator = 0;
	let blendFactor = 0;

	function onHeartbeat(deltaTime: number) {
		const framePrevious = frame;

		let frameSteps = 0;

		deltaTime = math.min(deltaTime, MAX_DELTA);
		accumulator += deltaTime;

		if (accumulator > 0) {
			frameSteps = math.floor(accumulator / FIXED_DELTA);
			frame += frameSteps;
			accumulator -= frameSteps * FIXED_DELTA;
		}

		for (let frameStep = 1; frameStep <= frameSteps; frameStep++) {
			const frameCurrent = framePrevious + frameStep;
			const isBehind = frameCurrent < frame;
			const actions = isBehind ? {} : actionQueue;

			for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
				scheduler.run(system.id, system.callback, FIXED_DELTA, frameCurrent, actions);

			if (actions === actionQueue) table.clear(actionQueue);
		}

		blendFactor = accumulator / FIXED_DELTA;

		for (const system of registeredSystems[SystemCallbackType.OnUpdate])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	function onPreSimulation(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnPhysics])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	function onPreRender(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnRender])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	RunService.Heartbeat.Connect(onHeartbeat);
	RunService.PreSimulation.Connect(onPreSimulation);
	RunService.PreRender.Connect(onPreRender);
}
