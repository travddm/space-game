import { RunService } from "@rbxts/services";

import { Entity } from "@rbxts/jecs";

import { log } from "common/shared/log";

import { world } from "./world";

const entityMap = new Map<number, Entity>();
const entityIdMap = new Map<Entity, number>();
const entityIds = new Array<number>();

const isServer = RunService.IsServer();

export function addEntity(entityId: number) {
	if (isServer) log.error("Do not call addEntity(entityId) on the server! Use world.entity() instead.", 1);
	if (entityMap.get(entityId) !== undefined) log.error(`Entity ${entityId} already exists!`);

	const entity = world.entity();
	entityMap.set(entityId, entity);
	entityIdMap.set(entity, entityId);
	entityIds.push(entityId);

	return entity;
}

export function removeEntity(entityId: number) {
	if (isServer) {
		const entity = entityId as Entity;

		if (world.has(entity)) {
			world.delete(entity);

			return true;
		} else return false;
	} else {
		const entity = entityMap.get(entityId);

		if (entity !== undefined) {
			world.delete(entity);
			entityMap.delete(entityId);
			entityIdMap.delete(entity);

			const idx = entityIds.indexOf(entityId);
			if (idx > -1) entityIds.unorderedRemove(idx);

			return true;
		} else return false;
	}
}

export function getEntity(entityId: number) {
	if (isServer) return entityId as Entity | undefined;
	else return entityMap.get(entityId);
}

export function getEntityId(entity: Entity) {
	if (isServer) return entity;
	else return entityIdMap.get(entity);
}

export function getEntityIds() {
	if (isServer) log.error("Do not call getEntityIds() on the server! Use world.query(...) instead.", 1);

	return entityIds;
}
