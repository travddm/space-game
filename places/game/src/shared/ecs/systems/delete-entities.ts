import { untrackEntity } from "../entity";
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

					if (playerId !== "server") continue;

					const entity = untrackEntity(action.data.entityId);

					if (entity !== undefined) world.delete(entity);
				}
		},
	},
});
