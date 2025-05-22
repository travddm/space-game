import { DataType, createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import { AnyActionData } from "./actions";
import { AnyComponentData } from "./components";

/**
 * Represents all of a player's actions played during the frame.
 */
export interface SerializablePlayerActions {
	playerId: string;
	actions: Array<AnyActionData>;
}

/**
 * Represents the server entity's state at the beginning of the frame.
 */
export interface SerializableEntity {
	/** The server entity's id. */
	readonly id: number;
	/** A list of all component data on the entity. */
	readonly components: Array<AnyComponentData>;
}

export type SerializableActions = Array<SerializablePlayerActions>;
export type SerializableEntities = Array<SerializableEntity>;

/**
 * Represents the server's state at the beginning of the frame.
 *
 * Entity snapshots should be rolled back in this order:
 * - Add missing entities
 * - Set component data on entities
 * - Remove unnecessary entities
 */
export interface SerializableServerSnapshot {
	readonly frame: number;
	readonly frameDelay: number;
	/** A map of playerIds to lists of actions to be played. */
	readonly actions: SerializableActions;
	/** A list of entity and component data to set. */
	readonly entities?: SerializableEntities;
}

/**
 * Represents the actions played by the client during the frame.
 */
export interface SerializableClientSnapshot {
	readonly frame: number;
	/** A list of actions to be played. */
	readonly actions: Array<AnyActionData>;
}

export const serverSnapshotSerializer = createBinarySerializer<DataType.Packed<SerializableServerSnapshot>>();

export const clientSnapshotSerializer = createBinarySerializer<DataType.Packed<SerializableClientSnapshot>>();
