import { UserInputService } from "@rbxts/services";

import { log } from "common/shared/log";

import { Input, InputName, defaultInputConfig } from "shared/input";

import { InputActionBuffer, InputActionCallback } from "./input-action";
import { inputActions } from "./input-actions";

export * from "./input-actions";

type MappedInputAction<N extends InputName[] = InputName[]> = {
	readonly callback: InputActionCallback<N>;
	readonly buffer: InputActionBuffer<N>;
};

const inputNameMap = new Map<Input, InputName>();
const inputActionMap = new Map<Input, MappedInputAction>();

export function startInputHandler() {
	// populate inputNameMap
	for (const [inputName, inputs] of pairs(defaultInputConfig)) {
		for (const input of inputs) {
			if (inputNameMap.has(input)) {
				log.warn(`Attempted to set input ${input} to more than a single inputName!`);
				continue;
			}

			inputNameMap.set(input, inputName);
		}
	}

	// populate inputActionMap
	for (const inputAction of inputActions) {
		const mappedInput: MappedInputAction = {
			callback: inputAction.callback,
			buffer: {} as InputActionBuffer<InputName[]>,
		};

		for (const inputName of inputAction.inputNames) {
			rawset(mappedInput.buffer, inputName, []);

			for (const input of defaultInputConfig[inputName]) inputActionMap.set(input, mappedInput);
		}
	}

	function bufferInput(inputObject: InputObject, gameProcessed: boolean) {
		if (gameProcessed) return;

		const mappedInput = inputActionMap.get(inputObject.UserInputType) ?? inputActionMap.get(inputObject.KeyCode);

		if (mappedInput) {
			const inputName = inputNameMap.get(inputObject.UserInputType) ?? inputNameMap.get(inputObject.KeyCode);

			if (inputName) mappedInput.buffer[inputName].push(inputObject);
		}
	}

	UserInputService.InputBegan.Connect(bufferInput);
	UserInputService.InputChanged.Connect(bufferInput);
	UserInputService.InputEnded.Connect(bufferInput);
}

export function flushInputHandler() {
	for (const [_, mappedInput] of inputActionMap) {
		const inputBuffer = mappedInput.buffer;

		let isEmpty = true;

		for (const [_, buf] of pairs(inputBuffer)) if (buf.size() > 0) isEmpty = false;

		if (!isEmpty) mappedInput.callback(inputBuffer);

		for (const [_, buf] of pairs(inputBuffer)) buf.clear();
	}
}
