import { getEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { addEntitiesSystem } from "./add-entities";

export const deleteEntitiesSystem = createSystem({
	name: "delete-entities",
	dependencies: [addEntitiesSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			const deleteEntityActions = actions.deleteEntity;

			if (deleteEntityActions)
				for (const action of deleteEntityActions) {
					const playerId = action.playerId;
					const entity = getEntity(action.data.entityId);

					if (entity === undefined) continue;

					// TODO: uncomment lol
					// if (playerId === "server")
					world.delete(entity);
				}
		},
	},
});
