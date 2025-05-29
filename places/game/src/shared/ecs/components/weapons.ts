import { Name } from "@rbxts/jecs";

import { WeaponTypeId } from "common/weapons";

import { world } from "../world";

export interface Weapons {
	readonly primaryFiring: boolean;
	readonly primaryFrame: number;
	readonly primaryTypeId: WeaponTypeId;
}

export const weaponsComponent = world.component<Weapons>();

world.set(weaponsComponent, Name, "weapons");
