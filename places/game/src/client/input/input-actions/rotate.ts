import { Workspace } from "@rbxts/services";

import { getAngleDifferenceY, getIntersectionY } from "common/util";

import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localMovablePlayerEntities = world
	.query(components.movable, clientComponents.modelRender)
	.with(clientComponents.local, components.player)
	.cached();

export const rotateInputAction = createInputAction([InputName.Rotate], (inputBuffer) => {
	const camera = Workspace.CurrentCamera;
	const inputs = inputBuffer[InputName.Rotate];
	const lastInput = inputs[inputs.size() - 1];

	if (camera) {
		const inputPosition = lastInput.Position;
		const ray = camera.ScreenPointToRay(inputPosition.X, inputPosition.Y);
		const targetPosition = getIntersectionY(ray.Origin, ray.Direction);

		for (const [entity, movable, modelRender] of localMovablePlayerEntities) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined) {
				const lookVector = movable.rotateDirection;
				const targetLookVector = targetPosition.sub(modelRender.model.Position).Unit;

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
