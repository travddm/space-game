import { UserInputService } from "@rbxts/services";

import { Input, defaultInputConfig } from "shared/input";

import { InputActionCallback } from "./input-action";
import { inputActions } from "./input-actions";

export * from "./input-actions";

export function startInputHandler() {
	const inputMap = new Map<Input, InputActionCallback[]>();

	for (const inputAction of inputActions) {
		const inputs = defaultInputConfig[inputAction.inputName];
		const callback = inputAction.callback;

		for (const input of inputs) {
			const callbacks = inputMap.get(input);

			if (callbacks) callbacks.push(callback);
			else inputMap.set(input, [callback]);
		}
	}

	function handleInput(inputObject: InputObject, gameProcessed: boolean) {
		if (gameProcessed) return;

		const callbacks = inputMap.get(inputObject.UserInputType) ?? inputMap.get(inputObject.KeyCode);

		if (callbacks) for (const callback of callbacks) callback(inputObject);
	}

	UserInputService.InputBegan.Connect(handleInput);
	UserInputService.InputChanged.Connect(handleInput);
	UserInputService.InputEnded.Connect(handleInput);
}
