import { Name } from "@rbxts/jecs";

import { world } from "../world";

export interface Movable {
	readonly moveSpeed: number;
	readonly moveDirection: Vector3;
	readonly moveVelocity: Vector3;
	readonly rotateSpeed: number;
	readonly rotateDirection: Vector3;
}

export const movableComponent = world.component<Movable>();

world.set(movableComponent, Name, "movable");
