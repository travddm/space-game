import { moveBackwardInputAction, moveForwardInputAction, moveLeftInputAction, moveRightInputAction } from "./move";
import { toggleJabbyInputAction } from "./open-jabby";
import { rotateInputAction } from "./rotate";

export const inputActions = [
	toggleJabbyInputAction,
	moveForwardInputAction,
	moveBackwardInputAction,
	moveRightInputAction,
	moveLeftInputAction,
	rotateInputAction,
];
