import { Entity } from "@rbxts/jecs";

import { components } from "../components";
import { getEntity, trackEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";

export const addEntitiesSystem = createSystem({
	name: "add-entities",
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			const addEntityActions = actions.addEntity;

			if (addEntityActions)
				for (const action of addEntityActions) {
					const playerId = action.playerId;
					const data = action.data;
					const entityId = data.serverEntityId;
					const entityComponents = data.components;

					if (playerId !== "server") continue;

					let entity: Entity;

					if (entityId !== undefined) {
						// client

						const e = getEntity(entityId);

						if (e !== undefined) {
							entity = e;
							for (const [componentName, component] of pairs(components))
								if (entityComponents[componentName] === undefined) world.remove(entity, component);
						} else {
							entity = world.entity();

							trackEntity(entityId, entity);
						}
					} else {
						// server

						entity = world.entity();

						trackEntity(entity, entity);

						data.serverEntityId = entity;
					}

					for (const [componentName, componentData] of pairs(entityComponents)) {
						const component = components[componentName];

						world.set(entity, component, componentData);
					}
				}
		},
	},
});
