import { DataType } from "@rbxts/flamework-binary-serializer";
import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Movable {
	readonly moveSpeed: DataType.u16;
	readonly moveDirection: Vector3;
}

export const movableComponent = world.component<Movable>();

world.set(movableComponent, Name, "movable");
