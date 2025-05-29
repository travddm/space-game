import { components } from "../components";
import { deleteLocalEntity, untrackEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { fireWeaponsSystem } from "./fire-weapons";

const projectileEntities = world.query(components.projectile).cached();

export const cleanupProjectilesSystem = createSystem({
	name: "cleanup-projectiles",
	dependencies: [fireWeaponsSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			for (const [entity, projectile] of projectileEntities)
				if (frame >= projectile.cleanupFrame) deleteLocalEntity(entity);
		},
	},
});
