import { Entity, InferComponent } from "@rbxts/jecs";

import { modelComponent } from "./model";
import { movableComponent } from "./movable";
import { nametagComponent } from "./nametag";
import { playerComponent } from "./player";
import { projectileComponent } from "./projectile";
import { transformComponent } from "./transform";
import { weaponsComponent } from "./weapons";

export const components = {
	transform: transformComponent,
	movable: movableComponent,
	player: playerComponent,
	model: modelComponent,
	nametag: nametagComponent,
	weapons: weaponsComponent,
	projectile: projectileComponent,
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
