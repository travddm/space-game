import { ProjectileId } from "../projectiles";

export interface WeaponType {
	projectileType: ProjectileId;
	cooldown: number;
	speed: number;
	range: number;
}
