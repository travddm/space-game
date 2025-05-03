import { Networking } from "@flamework/networking";

export interface ClientToServerEvents {}

export interface ServerToClientEvents {}

export const globalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
