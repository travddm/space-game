import { Scheduler, SystemId } from "@rbxts/jabby/out/jabby/modules/types";

import { ActionDataByName } from "./actions";

export const enum SystemCallbackType {
	/** For updating game state on a fixed timestep. Uses `RunService.Heartbeat` and an accumulator. */
	OnFixedUpdate,

	/** For updating render state on a variable timestep. Uses `RunService.Heartbeat` */
	OnUpdate,

	/** For updating physics state on a variable timestep. Uses `RunService.PreSimulation` */
	OnPhysics,

	/** For updating render state on a variable timestep. Uses `RunService.PreRender` */
	OnRender,
}

export interface SystemFixedCallback {
	(deltaTime: number, frame: number, actions: ActionDataByName): void;
}

export interface SystemVariableCallback {
	(deltaTime: number, frame: number, blendFactor: number): void;
}

export type SystemCallback<T extends SystemCallbackType> = T extends SystemCallbackType.OnFixedUpdate
	? SystemFixedCallback
	: SystemVariableCallback;

export interface System {
	readonly name: string;
	readonly dependencies?: ReadonlyArray<System>;
	readonly callbacks: {
		readonly [T in SystemCallbackType]?: SystemCallback<T>;
	};
}

type RegisteredSystem<T extends SystemCallbackType> = {
	id: SystemId;
	callback: SystemCallback<T>;
};

export function createSystem(system: System) {
	return system;
}

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

export function registerSystems(scheduler: Scheduler, systems: System[]) {
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
