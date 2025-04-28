import { Name } from "@rbxts/jecs";

import { world } from "../world";

export const cframeComponent = world.component<CFrame>();

world.set(cframeComponent, Name, "cframe");
