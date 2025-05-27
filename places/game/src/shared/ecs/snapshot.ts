import { CachedQuery, Entity } from "@rbxts/jecs";

import { AnyComponent, AnyComponentData, ComponentName, components } from "./components";
import { getEntity, getEntityId, getEntityIds, trackEntity, untrackEntity } from "./entity";
import { SerializableEntities, SerializableEntity } from "./serializers";
import { world } from "./world";

const componentQueries = new Map<ComponentName, CachedQuery<[AnyComponent]>>();

for (const [componentName, component] of pairs(components)) {
	componentQueries.set(componentName, world.query(component).cached());
}

export function getSerializableEntities(): SerializableEntities {
	const snapshotEntities = new Array<SerializableEntity>();
	const addedEntityComponents = new Map<Entity, AnyComponentData[]>();

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
			}
		}
	}

	return snapshotEntities;
}

export function applySerializableEntities(entities: SerializableEntities) {
	const foundEntityIds = new Set<number>();

	for (const serializableEntity of entities) {
		const entityId = serializableEntity.id;
		let entity = getEntity(entityId);

		if (entity === undefined) {
			entity = world.entity();

			trackEntity(entityId, entity);
		}

		for (const serializableComponent of serializableEntity.components) {
			const component = components[serializableComponent.name];

			world.set(entity, component, serializableComponent.data);
		}

		foundEntityIds.add(entityId);
	}

	for (const entityId of getEntityIds())
		if (!foundEntityIds.has(entityId)) {
			const entity = untrackEntity(entityId);

			if (entity !== undefined) world.delete(entity);
		}
}
