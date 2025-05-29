import { EntityAction, createAction } from "../action";

export interface FirePrimary extends EntityAction {
	readonly active: boolean;
}

export const firePrimary = createAction<FirePrimary>();
