import { RunService } from "@rbxts/services";

import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localMovableShipEntities = world.query(clientComponents.local).with(components.movable, components.ship).cached();

const directionsPressed = {
	forward: false,
	backward: false,
	left: false,
	right: false,
};

let connection: RBXScriptConnection | undefined;

function updateMovementDirection() {
	if (connection) return;

	connection = RunService.PreRender.Once(() => {
		connection = undefined;

		for (const [entity] of localMovableShipEntities) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined)
				queueAction("moveEntity", {
					entityId,
					moveDirection: new Vector3(
						(directionsPressed.right ? 1 : 0) - (directionsPressed.left ? 1 : 0),
						0,
						(directionsPressed.backward ? 1 : 0) - (directionsPressed.forward ? 1 : 0),
					).Unit,
				});
		}
	});
}

export const moveForwardInputAction = createInputAction(InputName.MoveForward, (input) => {
	if (input.UserInputState === Enum.UserInputState.Begin) directionsPressed.forward = true;
	else directionsPressed.forward = false;

	updateMovementDirection();
});

export const moveBackwardInputAction = createInputAction(InputName.MoveBackward, (input) => {
	if (input.UserInputState === Enum.UserInputState.Begin) directionsPressed.backward = true;
	else directionsPressed.backward = false;

	updateMovementDirection();
});

export const moveLeftInputAction = createInputAction(InputName.MoveLeft, (input) => {
	if (input.UserInputState === Enum.UserInputState.Begin) directionsPressed.left = true;
	else directionsPressed.left = false;

	updateMovementDirection();
});

export const moveRightInputAction = createInputAction(InputName.MoveRight, (input) => {
	if (input.UserInputState === Enum.UserInputState.Begin) directionsPressed.right = true;
	else directionsPressed.right = false;

	updateMovementDirection();
});
