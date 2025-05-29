import { CachedQuery, Entity } from "@rbxts/jecs";

import { AnyComponent, AnyComponentData, ComponentName, components } from "./components";
import {
	deleteLocalEntity,
	getEntity,
	getEntityId,
	getEntityIds,
	getLocalEntities,
	trackEntity,
	untrackEntity,
} from "./entity";
import { SerializableEntities, SerializableEntity } from "./serializers";
import { world } from "./world";

const componentQueries = new Map<ComponentName, CachedQuery<[AnyComponent]>>();

for (const [componentName, component] of pairs(components)) {
	componentQueries.set(componentName, world.query(component).cached());
}

export function getSerializableEntities(): SerializableEntities {
	const snapshotEntities = new Array<SerializableEntity>();
	const addedEntityComponents = new Map<Entity, AnyComponentData[]>();
	const localEntities = getLocalEntities();

	for (const [componentName, query] of componentQueries) {
		for (const [entity, componentData] of query) {
			const entityId = getEntityId(entity);

			if (entityId !== undefined) {
				const serializableComponent = {
					name: componentName,
					data: componentData,
				} as AnyComponentData;

				let serializableComponents = addedEntityComponents.get(entity);

				if (serializableComponents) {
					serializableComponents.push(serializableComponent);
				} else {
					serializableComponents = [serializableComponent];

					const serializableEntity = {
						id: entityId,
						components: serializableComponents,
					};

					snapshotEntities.push(serializableEntity);
					addedEntityComponents.set(entity, serializableComponents);
				}
			} else if (localEntities.includes(entity)) {
				const serializableComponent = {
					name: componentName,
					data: componentData,
				} as AnyComponentData;

				let serializableComponents = addedEntityComponents.get(entity);

				if (serializableComponents) {
					serializableComponents.push(serializableComponent);
				} else {
					serializableComponents = [serializableComponent];

					const serializableEntity = {
						id: -entity,
						components: serializableComponents,
					};

					snapshotEntities.push(serializableEntity);
					addedEntityComponents.set(entity, serializableComponents);
				}
			}
		}
	}

	return snapshotEntities;
}

export function applySerializableEntities(entities: SerializableEntities, overwriteLocal: boolean) {
	const foundEntityIds = new Set<number>();

	for (const serializableEntity of entities) {
		const entityId = serializableEntity.id;
		const isLocal = entityId < 0;

		let entity = isLocal ? (-entityId as Entity) : getEntity(entityId);

		if (entity === undefined) {
			entity = world.entity();

			trackEntity(entityId, entity);
		}

		foundEntityIds.add(entityId);

		for (const serializableComponent of serializableEntity.components) {
			const component = components[serializableComponent.name];

			world.set(entity, component, serializableComponent.data);
		}
	}

	for (const entityId of getEntityIds())
		if (!foundEntityIds.has(entityId)) {
			const entity = untrackEntity(entityId);

			if (entity !== undefined) world.delete(entity);
		}

	if (overwriteLocal)
		for (const entity of getLocalEntities()) if (!foundEntityIds.has(-entity)) deleteLocalEntity(entity);
}
