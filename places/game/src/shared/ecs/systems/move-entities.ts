import { components } from "../components";
import { getEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { deleteEntitiesSystem } from "./delete-entities";

const movableEntities = world.query(components.cframe, components.movable).cached();

export const moveEntitiesSystem = createSystem({
	name: "move-entities",
	dependencies: [deleteEntitiesSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			const moveEntityActions = actions.moveEntity;

			// apply actions
			if (moveEntityActions)
				for (const action of moveEntityActions) {
					const playerId = action.playerId;
					const entity = getEntity(action.data.entityId);

					if (entity === undefined) continue;

					const movable = world.get(entity, components.movable);

					if (movable && (playerId === "server" || playerId === world.get(entity, components.player))) {
						const moveDirection = action.data.moveDirection.Unit;

						world.set(entity, components.movable, {
							...movable,
							moveDirection: moveDirection.FuzzyEq(moveDirection) ? moveDirection : Vector3.zero,
						});
					}
				}

			// move the entities
			for (const [entity, cframe, movable] of movableEntities) {
				const moveDirection = movable.moveDirection;

				if (moveDirection !== Vector3.zero) {
					const newCFrame = cframe.add(movable.moveDirection.mul(movable.maxSpeed).mul(deltaTime));

					if (!cframe.FuzzyEq(newCFrame)) world.set(entity, components.cframe, newCFrame);
				}
			}
		},
	},
});
