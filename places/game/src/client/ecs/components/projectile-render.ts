import { Name } from "@rbxts/jecs";

import { world } from "shared/ecs";

export interface ProjectileRender {
	readonly currentTransform: CFrame;
	readonly previousTransform: CFrame;
}

export const projectileRenderComponent = world.component<ProjectileRender>();

world.set(projectileRenderComponent, Name, "projectileRender");
