import { ProjectileTypeId } from "../projectiles";

export interface WeaponType {
	cooldown: number;

	projectileTypeId: ProjectileTypeId;
	projectileSpeed: number;
	projectileRange: number;
}
