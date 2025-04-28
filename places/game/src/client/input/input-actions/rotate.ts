import { RunService, Workspace } from "@rbxts/services";

import { getIntersectionY } from "common/shared/util";

import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localShipEntities = world
	.query(clientComponents.shipRender)
	.with(clientComponents.local, components.ship)
	.cached();

let targetPosition = Vector3.zero;

let connection: RBXScriptConnection | undefined;

function updateRotateDirection() {
	if (connection) return;

	connection = RunService.PreRender.Once(() => {
		connection = undefined;

		for (const [entity, shipRender] of localShipEntities) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined)
				queueAction("rotateEntity", {
					entityId,
					rotateDirection: shipRender.model.Position.sub(targetPosition).Unit,
				});
		}
	});
}

export const rotateInputAction = createInputAction(InputName.Rotate, (input) => {
	const camera = Workspace.CurrentCamera;

	if (camera) {
		const inputPosition = input.Position;

		const ray = camera.ScreenPointToRay(inputPosition.X, inputPosition.Y);

		targetPosition = getIntersectionY(ray.Origin, ray.Direction);

		updateRotateDirection();
	}
});
