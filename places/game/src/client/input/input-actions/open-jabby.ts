import { InputName } from "shared/input";

import { toggleJabby } from "client/jabby";

import { createInputAction } from "../input-action";

export const toggleJabbyInputAction = createInputAction(InputName.ToggleJabby, (input) => {
	if (input.UserInputState === Enum.UserInputState.Begin) toggleJabby();
});
