import { DataType, createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import { AnyActionData } from "./ecs/actions";
import { AnyComponentData } from "./ecs/components";

/**
 * Represents the server entity's state at the beginning of the given frame number.
 */
export interface SerializableEntity {
	/** The server entity's id. */
	readonly id: DataType.i32;
	/** A list of all component data on the entity. */
	readonly components?: Array<AnyComponentData>;
}

/**
 * Represents the server's state at the given frame number.
 *
 * Snapshots should be rolled back in this order:
 * - Add missing entities
 * - Set component data on entities
 * - Remove unnecessary entities
 * - Replay actions
 *
 * Note: if `entities` is not present, roll back to an earlier frame.
 */
export interface SerializableSnapshot {
	/** The server frame number where this snapshot is valid. */
	readonly frame: number;
	/** A list of actions to play. */
	readonly actions: Array<AnyActionData>;
	/** A list of entity and component data to set. */
	readonly entities?: Array<SerializableEntity>;
}

export const snapshotSerializer = createBinarySerializer<DataType.Packed<SerializableSnapshot>>();
