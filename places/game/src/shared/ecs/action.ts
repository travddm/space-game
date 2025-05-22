import { Players, RunService } from "@rbxts/services";

export type InferAction<A> = A extends Action<infer D> ? D : unknown;
export type InferActionData<A> = A extends Action<infer D> ? ActionData<D> : unknown;

interface ActionData<D> {
	readonly playerId: string;
	readonly data: D;
}

export interface Action<D> {
	(data: D): ActionData<D>;
}

export interface EntityAction {
	entityId: number;
}

export const playerId = RunService.IsClient() ? tostring(Players.LocalPlayer?.UserId) : "server";

export function createAction<D = unknown>(): Action<D> {
	return (data: D) => {
		return {
			playerId,
			data,
		};
	};
}
