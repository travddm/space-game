import { Name } from "@rbxts/jecs";

import { world } from "shared/ecs";

export interface NametagRender {
	readonly hidden: boolean;
}

export const nametagRenderComponent = world.component<NametagRender>();

world.set(nametagRenderComponent, Name, "nametag-render");
