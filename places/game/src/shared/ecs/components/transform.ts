import { Name } from "@rbxts/jecs";

import { world } from "../world";

export const transformComponent = world.component<CFrame>();

world.set(transformComponent, Name, "transform");
