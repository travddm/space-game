import { DataType, createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import { AnyActionData } from "./ecs/actions";
import { AnyComponentData } from "./ecs/components";

/**
 * Represents the server entity's state at the beginning of the frame.
 */
export interface SerializableEntity {
	/** The server entity's id. */
	readonly id: number;
	/** A list of all component data on the entity. */
	readonly components: Array<AnyComponentData>;
}

/**
 * Represents the server's state at the beginning of the frame.
 *
 * Entity snapshots should be rolled back in this order:
 * - Add missing entities
 * - Set component data on entities
 * - Remove unnecessary entities
 */
export interface SerializableEntitySnapshot {
	readonly frame: number;
	/** A list of entity and component data to set. */
	readonly entities: Array<SerializableEntity>;
}

/**
 * Represents the actions played on the server during the frame.
 */
export interface SerializableActionSnapshot {
	readonly frame: number;
	/** A map of playerIds to lists of actions to be played. */
	readonly actions: Map<string, Array<AnyActionData>>;
}

/**
 * Represents the actions played by the client during the frame.
 */
export interface SerializableClientSnapshot {
	readonly frame: number;
	/** A list of actions to be played. */
	readonly actions: Array<AnyActionData>;
}

export const entitySnapshotSerializer = createBinarySerializer<DataType.Packed<SerializableEntitySnapshot>>();

export const actionSnapshotSerializer = createBinarySerializer<DataType.Packed<SerializableActionSnapshot>>();

export const clientSnapshotSerializer = createBinarySerializer<DataType.Packed<SerializableClientSnapshot>>();
