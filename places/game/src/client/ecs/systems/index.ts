import { System, systems as sharedSystems } from "shared/ecs";

import { renderCameraSystem } from "./render-camera";
import { renderDustSystem } from "./render-dust";
import { renderModelsSystem } from "./render-models";
import { renderNametagSystem } from "./render-nametags";
import { renderProjectilesSystem } from "./render-projectiles";

export const clientSystems: System[] = [
	renderCameraSystem,
	renderModelsSystem,
	renderNametagSystem,
	renderDustSystem,
	renderProjectilesSystem,
	...sharedSystems,
];
