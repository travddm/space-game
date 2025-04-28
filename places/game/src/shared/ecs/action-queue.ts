import { InferAction, InferActionData } from "./action";
import { ActionName, Actions, AnyActionData, actions } from "./actions";

export type ActionQueue = {
	[N in ActionName]?: InferActionData<Actions[N]>[];
};

export const actionQueue: ActionQueue = {};

export function queueAction<N extends ActionName>(name: N, data: InferAction<Actions[N]>) {
	const action = actions[name](data as UnionToIntersection<AnyActionData>);

	let queue = actionQueue[name] as InferActionData<Actions[N]>[];

	if (queue === undefined) actionQueue[name] = queue = [action as UnionToIntersection<AnyActionData>];
	else queue.push(action as UnionToIntersection<AnyActionData>);
}

export function queueActionData(actionQueue: ActionQueue, actionData: AnyActionData) {
	let queue = actionQueue[actionData.name] as ActionQueue[ActionName];

	if (queue === undefined)
		actionQueue[actionData.name] = queue = [actionData.data as UnionToIntersection<AnyActionData>];
	else queue.push(actionData.data as UnionToIntersection<AnyActionData>);
}
