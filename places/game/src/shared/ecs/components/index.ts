import { Entity, InferComponent } from "@rbxts/jecs";

import { movableComponent } from "./movable";
import { nametagComponent } from "./nametag";
import { playerComponent } from "./player";
import { shipComponent } from "./ship";
import { transformComponent } from "./transform";

export const components = {
	transform: transformComponent,
	movable: movableComponent,
	player: playerComponent,
	ship: shipComponent,
	nametag: nametagComponent,
};

export type Components = typeof components;
export type ComponentName = keyof Components;

export type AnyComponent = InferComponent<Components[ComponentName]>;
export type AnyComponentData = {
	[N in ComponentName]: {
		readonly name: N;
		readonly data: Components[N] extends Entity<infer T> ? (T extends defined ? T : undefined) : undefined;
	};
}[ComponentName];
