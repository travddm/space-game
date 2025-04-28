import { EntityAction, createAction } from "../action";

export interface DeleteEntity extends EntityAction {}

export const deleteEntity = createAction<DeleteEntity>();
