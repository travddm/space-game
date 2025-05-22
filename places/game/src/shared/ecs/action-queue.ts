import { InferAction } from "./action";
import { ActionDataByName, ActionName, Actions, AnyActionData, actions } from "./actions";
import { SerializableActions, SerializablePlayerActions } from "./serializers";

export const actionQueue = new Array<AnyActionData>();

export function queueAction<N extends ActionName>(name: N, data: InferAction<Actions[N]>) {
	const actionData = actions[name](data as never);

	actionQueue.push({
		name,
		data: actionData,
	} as AnyActionData);
}

export function sortPlayerActions(a: SerializablePlayerActions, b: SerializablePlayerActions) {
	return a.playerId < b.playerId;
}

export function getActionDataByName(serializableActions: SerializableActions) {
	const actionDataByName: ActionDataByName = {};

	for (const playerActions of serializableActions) {
		for (const actionData of playerActions.actions) {
			const actionName = actionData.name;
			const actionDataList = actionDataByName[actionName];

			if (actionDataList) actionDataList.push(actionData.data as never);
			else actionDataByName[actionName] = [actionData.data as never];
		}
	}

	return actionDataByName;
}
