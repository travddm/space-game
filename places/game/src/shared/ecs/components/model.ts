import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Model {
	// todo: add models
	readonly modelId: string;
}

export const modelComponent = world.component<Model>();

world.set(modelComponent, Name, "model");
