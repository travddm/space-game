import { System } from "../system";
import { addEntitiesSystem } from "./add-entities";
import { cleanupProjectilesSystem } from "./cleanup-projectiles";
import { deleteEntitiesSystem } from "./delete-entities";
import { fireWeaponsSystem } from "./fire-weapons";
import { moveEntitiesSystem } from "./move-entities";

export const systems: System[] = [
	addEntitiesSystem,
	deleteEntitiesSystem,
	moveEntitiesSystem,
	fireWeaponsSystem,
	cleanupProjectilesSystem,
];
