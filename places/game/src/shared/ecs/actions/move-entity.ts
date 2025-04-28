import { EntityAction, createAction } from "../action";

export interface MoveEntity extends EntityAction {
	readonly moveDirection: Vector3;
}

export const moveEntity = createAction<MoveEntity>();
