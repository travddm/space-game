import { components, getEntityId, queueAction, world } from "shared/ecs";
import { InputName } from "shared/input";

import { clientComponents } from "client/ecs";

import { createInputAction } from "../input-action";

const localPlayerWeaponsEntities = world
	.query(components.weapons)
	.with(clientComponents.local, components.player)
	.cached();

export const firePrimaryAction = createInputAction([InputName.FirePrimary], (inputBuffer) => {
	const inputs = inputBuffer[InputName.FirePrimary];
	const lastInput = inputs[inputs.size() - 1];

	const active = lastInput.UserInputState === Enum.UserInputState.Begin;

	for (const [entity, weapons] of localPlayerWeaponsEntities) {
		const entityId = getEntityId(entity);

		if (entityId !== undefined) {
			if (weapons.primaryFiring !== active) {
				queueAction("firePrimary", {
					entityId,
					active,
				});
			}
		}
	}
});
