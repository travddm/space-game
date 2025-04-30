import { System, systems as sharedSystems } from "shared/ecs";

import { renderCameraSystem } from "./render-camera";
import { renderDustSystem } from "./render-dust";
import { renderShipsSystem } from "./render-ships";

export const clientSystems: System[] = [renderCameraSystem, renderShipsSystem, renderDustSystem, ...sharedSystems];
