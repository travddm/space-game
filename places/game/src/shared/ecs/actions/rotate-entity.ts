import { EntityAction, createAction } from "../action";

export interface RotateEntity extends EntityAction {
	readonly rotation: number;
}

export const rotateEntity = createAction<RotateEntity>();
