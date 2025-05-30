import { System } from "../system";
import { addEntitiesSystem } from "./add-entities";
import { deleteEntitiesSystem } from "./delete-entities";
import { fireWeaponsSystem } from "./fire-weapons";
import { moveEntitiesSystem } from "./move-entities";
import { moveProjectilesSystem } from "./move-projectiles";

export const systems: System[] = [
	addEntitiesSystem,
	deleteEntitiesSystem,
	moveEntitiesSystem,
	fireWeaponsSystem,
	moveProjectilesSystem,
];
