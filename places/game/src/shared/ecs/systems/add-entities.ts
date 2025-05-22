import { components } from "../components";
import { addEntity, getEntity } from "../entity";
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
					const entityId = action.data.entityId;
					const entityComponents = action.data.components;

					if (playerId !== "server") continue;

					let entity = getEntity(entityId);
					if (entity !== undefined) {
						for (const [componentName, component] of pairs(components))
							if (entityComponents[componentName] === undefined) world.remove(entity, component);
					} else entity = addEntity(entityId);

					for (const [componentName, componentData] of pairs(entityComponents)) {
						const component = components[componentName];

						world.set(entity, component, componentData);
					}
				}
		},
	},
});
