import { Name } from "@rbxts/jecs";

import { world } from "../world";

export const playerComponent = world.component<string>();

world.set(playerComponent, Name, "player");
