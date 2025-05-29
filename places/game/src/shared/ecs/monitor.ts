import { Entity, OnAdd, OnRemove } from "@rbxts/jecs";

import { world } from "./world";

export function monitor(component: Entity) {
	const onAdd = world.get(component, OnAdd);
	const onRemove = world.get(component, OnRemove);

	const addStorage = new Array<Entity>();
	const removeStorage = new Array<Entity>();

	const add = onAdd
		? (entity: Entity) => {
				onAdd(entity);
				addToStorage(entity);
			}
		: (entity: Entity) => addToStorage(entity);

	const remove = onRemove
		? (entity: Entity) => {
				onRemove(entity);
				removeFromStorage(entity);
			}
		: (entity: Entity) => removeFromStorage(entity);

	function addToStorage(entity: Entity) {
		const removeIdx = removeStorage.indexOf(entity);

		if (removeIdx > -1) {
			removeStorage.unorderedRemove(removeIdx);
		} else addStorage.push(entity);
	}

	function removeFromStorage(entity: Entity) {
		const addIdx = addStorage.indexOf(entity);

		if (addIdx > -1) {
			addStorage.unorderedRemove(addIdx);
		} else removeStorage.push(entity);
	}

	world.set(component, OnAdd, add);
	world.set(component, OnRemove, remove);

	function unhook() {
		if (onAdd) world.set(component, OnAdd, onAdd);
		else world.remove(component, OnAdd);

		if (onRemove) world.set(component, OnRemove, onRemove);
		else world.remove(component, OnRemove);
	}

	return {
		unhook,
		*added() {
			while (addStorage.size() > 0) yield addStorage.pop()!;
		},
		*removed() {
			while (removeStorage.size() > 0) yield removeStorage.pop()!;
		},
	};
}
