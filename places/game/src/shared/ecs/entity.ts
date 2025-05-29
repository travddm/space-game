import { Entity } from "@rbxts/jecs";

import { log } from "common/log";

import { world } from "./world";

interface LocalEntityData {
	entityType: string;
	frameCreated: number;
	localEntityId: number;
}

const entityMap = new Map<number, Entity>();
const entityIdMap = new Map<Entity, number>();
const entityIds = new Array<number>();
const localEntities = new Array<Entity>();
const localEntityDatas = new Map<Entity, LocalEntityData>();
const localEntityFrameTypes = new Map<string, Map<number, Map<number, Entity>>>();

export function addLocalEntity(entityType: string, frameCreated: number, localEntityId: number) {
	let localEntityFrames = localEntityFrameTypes.get(entityType);

	if (!localEntityFrames) {
		localEntityFrames = new Map();

		localEntityFrameTypes.set(entityType, localEntityFrames);
	}

	let localEntityFrame = localEntityFrames.get(frameCreated);

	if (!localEntityFrame) {
		localEntityFrame = new Map();

		localEntityFrames.set(frameCreated, localEntityFrame);
	}

	let localEntity = localEntityFrame.get(localEntityId);

	if (localEntity === undefined) {
		localEntity = world.entity();

		localEntityFrame.set(localEntityId, localEntity);
		localEntityDatas.set(localEntity, {
			entityType,
			frameCreated,
			localEntityId,
		});
		localEntities.push(localEntity);
	}

	return localEntity;
}

export function deleteLocalEntity(entity: Entity) {
	world.delete(entity);

	const localEntityData = localEntityDatas.get(entity);
	const localEntityIdx = localEntities.indexOf(entity);

	if (localEntityData) {
		localEntityDatas.delete(entity);

		const entityType = localEntityData.entityType;
		const frameCreated = localEntityData.frameCreated;
		const localEntityId = localEntityData.localEntityId;

		const localEntityFrames = localEntityFrameTypes.get(entityType);
		const localEntityFrame = localEntityFrames && localEntityFrames.get(frameCreated);

		if (localEntityFrame) {
			localEntityFrame.delete(localEntityId);

			if (localEntityFrame.isEmpty()) localEntityFrames.delete(frameCreated);
		}
	}

	if (localEntityIdx > -1) localEntities.unorderedRemove(localEntityIdx);
}

export function trackEntity(entityId: number, entity: Entity) {
	if (entityMap.get(entityId) !== undefined) log.error(`Entity ${entityId} already exists!`);

	entityMap.set(entityId, entity);
	entityIdMap.set(entity, entityId);
	entityIds.push(entityId);
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

export function getLocalEntities() {
	return localEntities;
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
