import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Nametag {
	readonly name: string;
}

export const nametagComponent = world.component<Nametag>();

world.set(nametagComponent, Name, "nametag");
