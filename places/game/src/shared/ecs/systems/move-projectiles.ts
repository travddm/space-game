import { components } from "../components";
import { deleteLocalEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { moveEntitiesSystem } from "./move-entities";

const projectileEntities = world.query(components.transform, components.projectile).cached();

export const moveProjectilesSystem = createSystem({
	name: "move-projectiles",
	dependencies: [moveEntitiesSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			for (const [entity, transform, projectile] of projectileEntities) {
				if (frame >= projectile.cleanupFrame) deleteLocalEntity(entity);
				else world.set(entity, components.transform, transform.add(projectile.velocity.mul(deltaTime)));
			}
		},
	},
});
