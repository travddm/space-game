import { ProjectileId } from "../projectiles";

export interface WeaponType {
	cooldown: number;

	projectileTypeId: ProjectileId;
	projectileSpeed: number;
	projectileRange: number;
}
