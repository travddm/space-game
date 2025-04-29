import { getAngleBetweenVectors } from "common/shared/util";

import { components } from "../components";
import { getEntity } from "../entity";
import { SystemCallbackType, createSystem } from "../system";
import { world } from "../world";
import { deleteEntitiesSystem } from "./delete-entities";

const movableEntities = world.query(components.transform, components.movable).cached();

export const moveEntitiesSystem = createSystem({
	name: "move-entities",
	dependencies: [deleteEntitiesSystem],
	callbacks: {
		[SystemCallbackType.OnFixedUpdate]: (deltaTime, frame, actions) => {
			const moveEntityActions = actions.moveEntity;
			const rotateEntityActions = actions.rotateEntity;

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

			if (rotateEntityActions)
				for (const action of rotateEntityActions) {
					const playerId = action.playerId;
					const entity = getEntity(action.data.entityId);

					if (entity === undefined) continue;

					const movable = world.get(entity, components.movable);

					if (movable && (playerId === "server" || playerId === world.get(entity, components.player))) {
						const rotateDirection = action.data.rotateDirection.Unit;

						world.set(entity, components.movable, {
							...movable,
							rotateDirection: rotateDirection.FuzzyEq(rotateDirection) ? rotateDirection : Vector3.zero,
						});
					}
				}

			// move the entities
			for (const [entity, transform, movable] of movableEntities) {
				const moveSpeed = movable.moveSpeed;
				const moveDirection = movable.moveDirection;
				const moveVelocity = movable.moveVelocity;
				const rotateDirection = movable.rotateDirection;

				let newTransform = transform;

				if (rotateDirection !== Vector3.zero) {
					const theta = getAngleBetweenVectors(newTransform.LookVector, rotateDirection);

					if (theta > 0) {
						const rotateCFrame = CFrame.lookAt(Vector3.zero, rotateDirection);
						const alpha = math.min(movable.rotateSpeed * deltaTime, theta) / theta;

						newTransform = newTransform.Rotation.Lerp(rotateCFrame, alpha).add(newTransform.Position);
					}
				}

				if (moveVelocity !== Vector3.zero || moveDirection !== Vector3.zero) {
					const accelSpeed = moveSpeed * deltaTime;

					let newMoveVelocity;

					if (moveDirection !== Vector3.zero) {
						const acceleration = newTransform
							.VectorToWorldSpace(
								new Vector3(
									moveDirection.X,
									0,
									moveDirection.Z > 0 ? moveDirection.Z / 2 : moveDirection.Z * 2,
								),
							)
							.mul(accelSpeed);

						newMoveVelocity = moveVelocity.add(acceleration);

						if (newMoveVelocity.Magnitude > moveSpeed)
							newMoveVelocity = newMoveVelocity.Unit.mul(moveSpeed);
					} else if (moveVelocity.Magnitude > accelSpeed) {
						newMoveVelocity = moveVelocity.sub(moveVelocity.Unit.mul(accelSpeed));
					} else newMoveVelocity = Vector3.zero;

					if (!moveVelocity.FuzzyEq(newMoveVelocity))
						world.set(entity, components.movable, {
							...movable,
							moveVelocity: newMoveVelocity,
						});

					if (newMoveVelocity !== Vector3.zero)
						newTransform = newTransform.add(newMoveVelocity.mul(deltaTime));
				}

				if (!transform.FuzzyEq(newTransform)) world.set(entity, components.transform, newTransform);
			}
		},
	},
});
