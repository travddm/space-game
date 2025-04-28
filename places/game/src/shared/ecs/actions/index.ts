import { InferActionData } from "../action";
import { addEntity } from "./add-entity";
import { deleteEntity } from "./delete-entity";
import { moveEntity } from "./move-entity";
import { rotateEntity } from "./rotate-entity";

export const actions = {
	addEntity,
	deleteEntity,
	moveEntity,
	rotateEntity,
};

export type Actions = typeof actions;
export type ActionName = keyof Actions;

export type AnyAction = InferActionData<Actions[ActionName]>;
export type AnyActionData = {
	[N in ActionName]: {
		readonly name: N;
		readonly data: InferActionData<Actions[N]>;
	};
}[ActionName];
