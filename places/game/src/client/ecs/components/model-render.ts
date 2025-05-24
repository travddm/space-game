import { Name } from "@rbxts/jecs";

import { world } from "shared/ecs";

export interface ModelRender {
	readonly model: BasePart;
	readonly currentTransform: CFrame;
	readonly previousTransform: CFrame;
}

export const modelRenderComponent = world.component<ModelRender>();

world.set(modelRenderComponent, Name, "model-render");
