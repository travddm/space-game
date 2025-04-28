import { Name } from "@rbxts/jecs";

import { world } from "shared/ecs";

export interface ShipRender {
	readonly model: BasePart;
	readonly currentTransform: CFrame;
	readonly previousTransform: CFrame;
}

export const shipRenderComponent = world.component<ShipRender>();

world.set(shipRenderComponent, Name, "ship-render");
