import { EntityAction, createAction } from "../action";

export interface RotateEntity extends EntityAction {
	readonly rotateDirection: Vector3;
}

export const rotateEntity = createAction<RotateEntity>();
