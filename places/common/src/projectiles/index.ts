import { laserRed } from "./laser-red";

export const projectileTypes = {
	laserRed: laserRed,
};

export type ProjectileTypes = typeof projectileTypes;
export type ProjectileTypeId = keyof ProjectileTypes;

export { ProjectileType } from "./projectile-type";
