import { Entity } from "@rbxts/jecs";

import { log } from "common/shared/log";

import { world } from "./world";

const entityMap = new Map<number, Entity>();
const entityIdMap = new Map<Entity, number>();

export function addEntity(entityId: number) {
	if (entityMap.get(entityId) !== undefined) log.error(`Entity ${entityId} already exists!`);

	const entity = world.entity();
	entityMap.set(entityId, entity);
	entityIdMap.set(entity, entityId);

	return entity;
}

export function removeEntity(entityId: number) {
	const entity = entityMap.get(entityId);

	if (entity !== undefined) {
		world.delete(entity);
		entityMap.delete(entityId);
		entityIdMap.delete(entity);

		return true;
	}

	return false;
}

export function getEntity(entityId: number) {
	return entityMap.get(entityId);
}

export function getEntityId(entity: Entity) {
	return entityIdMap.get(entity);
}
