import { InputName } from "shared/input";

export type InputActionBuffer<N extends InputName[]> = {
	readonly [K in N[number]]: InputObject[];
};

export interface InputActionCallback<N extends InputName[]> {
	(inputBuffer: InputActionBuffer<N>): void;
}

export interface InputAction<N extends InputName[]> {
	readonly inputNames: N;
	readonly callback: InputActionCallback<N>;
}

export function createInputAction<N extends InputName[]>(
	inputNames: N,
	callback: InputActionCallback<N>,
): InputAction<N> {
	return {
		inputNames,
		callback,
	};
}
