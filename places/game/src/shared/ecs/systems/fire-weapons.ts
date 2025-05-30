import { weaponTypes } from "common/weapons";

import { components } from "../components";
import { addLocalEntity, getEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { moveProjectilesSystem } from "./move-projectiles";

const weaponsEntities = world.query(components.transform, components.weapons).cached();

export const fireWeaponsSystem = createSystem({
	name: "fire-weapons",
	dependencies: [moveProjectilesSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			const firePrimaryActions = actions.firePrimary;

			// apply actions
			if (firePrimaryActions)
				for (const action of firePrimaryActions) {
					const playerId = action.playerId;
					const entity = getEntity(action.data.entityId);

					if (entity === undefined) continue;

					const weapons = world.get(entity, components.weapons);

					if (weapons && (playerId === "server" || playerId === world.get(entity, components.player))) {
						const active = action.data.active;

						world.set(entity, components.weapons, {
							...weapons,
							primaryFiring: active,
						});
					}
				}

			// fire weapons
			let localEntityId = 0;

			for (const [entity, transform, weapons] of weaponsEntities) {
				if (weapons.primaryFiring && frame >= weapons.primaryFrame) {
					const weapon = weaponTypes[weapons.primaryTypeId];
					const speed = weapon.projectileSpeed;

					const player = world.get(entity, components.player);
					const movable = world.get(entity, components.movable);

					const projectileEntity = addLocalEntity("projectile", frame, localEntityId);

					const velocity = transform.LookVector.mul(speed).add(movable?.moveVelocity ?? Vector3.zero);

					world.set(projectileEntity, components.transform, transform);
					world.set(projectileEntity, components.projectile, {
						typeId: weapon.projectileTypeId,
						cleanupFrame: frame + math.floor(weapon.projectileRange / speed / deltaTime),
						velocity,
					});

					if (player !== undefined) world.set(projectileEntity, components.player, player);

					world.set(entity, components.weapons, {
						...weapons,
						primaryFrame: frame + math.floor(weapon.cooldown / deltaTime),
					});

					localEntityId++;
				}
			}
		},
	},
});
