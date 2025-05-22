import { Networking } from "@flamework/networking";

export interface ClientToServerEvents {
	start(): void;
	clientSnapshot(buffer: buffer): void;
}

export interface ServerToClientEvents {
	serverSnapshot(buffer: buffer): void;
}

export const globalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
