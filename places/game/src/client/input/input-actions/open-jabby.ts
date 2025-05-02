import { InputName } from "shared/input";

import { toggleJabby } from "client/jabby";

import { createInputAction } from "../input-action";

export const toggleJabbyInputAction = createInputAction(InputName.ToggleJabby, (inputs) => {
	const lastInput = inputs[inputs.size() - 1];

	if (lastInput.UserInputState === Enum.UserInputState.Begin) toggleJabby();
});
