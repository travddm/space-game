import { RunService } from "@rbxts/services";

import { InferComponent } from "@rbxts/jecs";

import { createAction } from "../action";
import { ComponentName, Components } from "../components";

export interface AddEntity {
	serverEntityId?: number;

	readonly components: {
		readonly [N in ComponentName]?: InferComponent<Components[N]>;
	};
}

const isServer = RunService.IsServer();

export const addEntity = createAction<AddEntity>((data) =>
	isServer ? data.serverEntityId === undefined : data.serverEntityId !== undefined,
);
