import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Ship {
	// todo: add ship types
	readonly shipType: number;
}

export const shipComponent = world.component<Ship>();

world.set(shipComponent, Name, "ship");
