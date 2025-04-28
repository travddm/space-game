import { InferComponent } from "@rbxts/jecs";

import { EntityAction, createAction } from "../action";
import { ComponentName, Components } from "../components";

export interface AddEntity extends EntityAction {
	readonly components: {
		readonly [N in ComponentName]?: InferComponent<Components[N]>;
	};
}

export const addEntity = createAction<AddEntity>();
