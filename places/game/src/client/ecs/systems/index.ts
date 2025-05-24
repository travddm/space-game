import { System, systems as sharedSystems } from "shared/ecs";

import { renderCameraSystem } from "./render-camera";
import { renderDustSystem } from "./render-dust";
import { renderModelsSystem } from "./render-models";

export const clientSystems: System[] = [renderCameraSystem, renderModelsSystem, renderDustSystem, ...sharedSystems];
