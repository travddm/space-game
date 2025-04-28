import { ActionQueue } from "./action-queue";

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
	(deltaTime: number, frame: number, actions: ActionQueue): void;
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

export function createSystem(system: System) {
	return system;
}
