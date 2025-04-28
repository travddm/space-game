import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Ship {
	readonly name: string;
}

export const shipComponent = world.component<Ship>();

world.set(shipComponent, Name, "ship");
