import { laser } from "./laser";

export const weaponTypes = {
	laser,
};

export type WeaponTypes = typeof weaponTypes;
export type WeaponId = keyof WeaponTypes;

export { WeaponType } from "./weapon-type";
