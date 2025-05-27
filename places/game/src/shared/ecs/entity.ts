import { Entity } from "@rbxts/jecs";

import { log } from "common/shared/log";

const entityMap = new Map<number, Entity>();
const entityIdMap = new Map<Entity, number>();
const entityIds = new Array<number>();
const localEntities = new Array<Entity>();

export function trackLocalEntity(entity: Entity) {
	if (!localEntities.includes(entity)) localEntities.push(entity);
}

export function trackEntity(entityId: number, entity: Entity) {
	if (entityMap.get(entityId) !== undefined) log.error(`Entity ${entityId} already exists!`);

	entityMap.set(entityId, entity);
	entityIdMap.set(entity, entityId);
	entityIds.push(entityId);
}

export function untrackLocalEntity(entity: Entity) {
	const idx = localEntities.indexOf(entity);

	if (idx > -1) localEntities.unorderedRemove(idx);
}

export function untrackEntity(entityId: number) {
	const entity = entityMap.get(entityId);

	if (entity !== undefined) {
		entityMap.delete(entityId);
		entityIdMap.delete(entity);

		const idx = entityIds.indexOf(entityId);
		if (idx > -1) entityIds.unorderedRemove(idx);

		return entity;
	}
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

export function getLocalEntities() {
	return localEntities;
}
