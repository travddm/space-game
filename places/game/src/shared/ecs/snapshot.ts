import { CachedQuery, Entity } from "@rbxts/jecs";

import { AnyComponent, AnyComponentData, ComponentName, components } from "./components";
import {
	getEntity,
	getEntityId,
	getEntityIds,
	getLocalEntities,
	trackEntity,
	untrackEntity,
	untrackLocalEntity,
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

export function applySerializableEntities(entities: SerializableEntities, overwrite: boolean) {
	const foundEntityIds = new Set<number>();
	const foundLocalEntities = new Set<Entity>();

	for (const serializableEntity of entities) {
		const entityId = serializableEntity.id;
		let entity: Entity;

		if (overwrite || entityId > 0) {
			let e = getEntity(entityId);

			if (e === undefined) {
				e = world.entity();

				trackEntity(entityId, e);
			}

			entity = e;

			foundEntityIds.add(entityId);
		} else {
			entity = -entityId as Entity;

			foundLocalEntities.add(entity);
		}

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

	for (const entity of getLocalEntities())
		if (overwrite || !foundLocalEntities.has(entity)) {
			untrackLocalEntity(entity);
			world.delete(entity);
		}
}
