import { InputName } from "shared/input";

export interface InputActionCallback {
	(inputs: InputObject[]): void;
}

export interface InputAction {
	inputName: InputName;
	callback: InputActionCallback;
}

export function createInputAction(inputName: InputName, callback: InputActionCallback): InputAction {
	return {
		inputName,
		callback,
	};
}
