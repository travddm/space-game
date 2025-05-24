import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localMovablePlayerEntities = world
	.query(clientComponents.local)
	.with(components.movable, components.player)
	.cached();

const directionsPressed = {
	forward: false,
	backward: false,
	left: false,
	right: false,
};

export const moveInputAction = createInputAction(
	[InputName.MoveForward, InputName.MoveBackward, InputName.MoveLeft, InputName.MoveRight],
	(inputBuffer) => {
		const forwardInputs = inputBuffer[InputName.MoveForward];
		const backwardInputs = inputBuffer[InputName.MoveBackward];
		const leftwardInputs = inputBuffer[InputName.MoveLeft];
		const rightwardInputs = inputBuffer[InputName.MoveRight];

		const lastForwardInput = forwardInputs[forwardInputs.size() - 1];
		const lastBackwardInput = backwardInputs[backwardInputs.size() - 1];
		const lastLeftwardInput = leftwardInputs[leftwardInputs.size() - 1];
		const lastRightwardInput = rightwardInputs[rightwardInputs.size() - 1];

		if (lastForwardInput)
			if (lastForwardInput.UserInputState === Enum.UserInputState.Begin) directionsPressed.forward = true;
			else directionsPressed.forward = false;

		if (lastBackwardInput)
			if (lastBackwardInput.UserInputState === Enum.UserInputState.Begin) directionsPressed.backward = true;
			else directionsPressed.backward = false;

		if (lastLeftwardInput)
			if (lastLeftwardInput.UserInputState === Enum.UserInputState.Begin) directionsPressed.left = true;
			else directionsPressed.left = false;

		if (lastRightwardInput)
			if (lastRightwardInput.UserInputState === Enum.UserInputState.Begin) directionsPressed.right = true;
			else directionsPressed.right = false;

		const moveDirection = new Vector3(
			(directionsPressed.right ? 1 : 0) - (directionsPressed.left ? 1 : 0),
			0,
			(directionsPressed.backward ? 1 : 0) - (directionsPressed.forward ? 1 : 0),
		).Unit;

		for (const [entity] of localMovablePlayerEntities) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined)
				queueAction("moveEntity", {
					entityId,
					moveDirection,
				});
		}
	},
);
