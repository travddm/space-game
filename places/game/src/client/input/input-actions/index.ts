import { moveBackwardInputAction, moveForwardInputAction, moveLeftInputAction, moveRightInputAction } from "./move";
import { toggleJabbyInputAction } from "./open-jabby";

export * from "./open-jabby";

export const inputActions = [
	toggleJabbyInputAction,
	moveForwardInputAction,
	moveBackwardInputAction,
	moveRightInputAction,
	moveLeftInputAction,
];
