import { Name } from "@rbxts/jecs";

import { world } from "shared/ecs";

export interface ShipRender {
	readonly currentCFrame: CFrame;
	readonly previousCFrame: CFrame;
}

export const shipRenderComponent = world.component<ShipRender>();

world.set(shipRenderComponent, Name, "ship-render");
