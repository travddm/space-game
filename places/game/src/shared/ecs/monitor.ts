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
				addStorage.push(entity);
			}
		: (entity: Entity) => addStorage.push(entity);

	const remove = onRemove
		? (entity: Entity) => {
				onRemove(entity);
				removeStorage.push(entity);
			}
		: (entity: Entity) => removeStorage.push(entity);

	world.set(component, OnAdd, add);
	world.set(component, OnRemove, remove);

	function unhook() {
		world.remove(component, OnAdd);
		world.remove(component, OnRemove);
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
