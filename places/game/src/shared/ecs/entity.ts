import { Entity } from "@rbxts/jecs";

import { log } from "common/shared/log";

import { world } from "./world";

const entityMap = new Map<number, Entity>();
const entityIdMap = new Map<Entity, number>();
const entityIds = new Array<number>();

let entityIdCounter = 0;

export function nextEntityId() {
	return entityIdCounter++;
}

export function addEntity(entityId: number) {
	if (entityMap.get(entityId) !== undefined) log.error(`Entity ${entityId} already exists!`);

	const entity = world.entity();
	entityMap.set(entityId, entity);
	entityIdMap.set(entity, entityId);
	entityIds.push(entityId);

	return entity;
}

export function removeEntity(entityId: number) {
	const entity = entityMap.get(entityId);

	if (entity !== undefined) {
		world.delete(entity);
		entityMap.delete(entityId);
		entityIdMap.delete(entity);

		const idx = entityIds.indexOf(entityId);
		if (idx > -1) entityIds.unorderedRemove(idx);

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

export function getEntityIds() {
	return entityIds;
}
