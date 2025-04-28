export enum InputName {
	ToggleJabby = "Toggle Jabby",
	MoveForward = "Move Forward",
	MoveBackward = "Move Backward",
	MoveLeft = "Move Left",
	MoveRight = "Move Right",
}

export const defaultInputConfig: InputConfig = {
	[InputName.ToggleJabby]: new Set([Enum.KeyCode.F4]),
	[InputName.MoveForward]: new Set([Enum.KeyCode.W, Enum.KeyCode.Up]),
	[InputName.MoveBackward]: new Set([Enum.KeyCode.S, Enum.KeyCode.Down]),
	[InputName.MoveLeft]: new Set([Enum.KeyCode.A, Enum.KeyCode.Left]),
	[InputName.MoveRight]: new Set([Enum.KeyCode.D, Enum.KeyCode.Right]),
};

export type Input = Enum.KeyCode | Enum.UserInputType;

export type Inputs = Set<Input>;

export type InputConfig = {
	[name in InputName]: Inputs;
};
