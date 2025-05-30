import { Name } from "@rbxts/jecs";

import { ProjectileTypeId } from "common/projectiles";

import { world } from "../world";

export interface Projectile {
	readonly typeId: ProjectileTypeId;
	readonly cleanupFrame: number;
	readonly velocity: Vector3;
}

export const projectileComponent = world.component<Projectile>();

world.set(projectileComponent, Name, "projectile");
