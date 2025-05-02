import { UserInputService } from "@rbxts/services";

import { Input, defaultInputConfig } from "shared/input";

import { InputActionCallback } from "./input-action";
import { inputActions } from "./input-actions";

export * from "./input-actions";

type MappedInput = {
	callbacks: InputActionCallback[];
	buffer: InputObject[];
};

const inputMap = new Map<Input, MappedInput>();

export function startInputHandler() {
	for (const inputAction of inputActions) {
		const inputs = defaultInputConfig[inputAction.inputName];
		const callback = inputAction.callback;

		for (const input of inputs) {
			const mappedInput = inputMap.get(input);

			if (mappedInput) mappedInput.callbacks.push(callback);
			else
				inputMap.set(input, {
					callbacks: [callback],
					buffer: [],
				});
		}
	}

	function bufferInput(inputObject: InputObject, gameProcessed: boolean) {
		if (gameProcessed) return;

		const mappedInput = inputMap.get(inputObject.UserInputType) ?? inputMap.get(inputObject.KeyCode);

		if (mappedInput) mappedInput.buffer.push(inputObject);
	}

	UserInputService.InputBegan.Connect(bufferInput);
	UserInputService.InputChanged.Connect(bufferInput);
	UserInputService.InputEnded.Connect(bufferInput);
}

export function flushInputHandler() {
	for (const [_, mappedInput] of inputMap) {
		const buffer = mappedInput.buffer;

		if (buffer.size() > 0) for (const callback of mappedInput.callbacks) callback(buffer);
	}
}
