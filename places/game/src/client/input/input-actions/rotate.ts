import { Workspace } from "@rbxts/services";

import { getAngleDifferenceY, getIntersectionY } from "common/shared/util";

import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localShipEntities = world
	.query(components.movable, clientComponents.shipRender)
	.with(clientComponents.local, components.ship)
	.cached();

export const rotateInputAction = createInputAction(InputName.Rotate, (inputs) => {
	const camera = Workspace.CurrentCamera;
	const lastInput = inputs[inputs.size() - 1];

	if (camera) {
		const inputPosition = lastInput.Position;
		const ray = camera.ScreenPointToRay(inputPosition.X, inputPosition.Y);
		const targetPosition = getIntersectionY(ray.Origin, ray.Direction);

		for (const [entity, movable, shipRender] of localShipEntities) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined) {
				const lookVector = movable.rotateDirection;
				const targetLookVector = targetPosition.sub(shipRender.model.Position).Unit;

				const angle = getAngleDifferenceY(lookVector, targetLookVector);

				if (math.abs(angle) > 0)
					queueAction("rotateEntity", {
						entityId,
						rotation: angle,
					});
			}
		}
	}
});
