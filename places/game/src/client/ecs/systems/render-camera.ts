import { Workspace } from "@rbxts/services";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";

import { clientComponents } from "../components";
import { renderShipsSystem } from "./render-ships";

const localShips = world.query(clientComponents.shipRender).with(clientComponents.local, components.ship).cached();

export const renderCameraSystem = createSystem({
	name: "render-camera",
	dependencies: [renderShipsSystem],
	callbacks: {
		[SystemCallbackType.OnRender]: (deltaTime, frame, blend) => {
			const camera = Workspace.CurrentCamera;

			if (camera) {
				let shipPosition = Vector3.zero;
				for (const [_, shipRender] of localShips) {
					shipPosition = shipRender.model.Position;
					break;
				}

				camera.CFrame = CFrame.lookAt(
					shipPosition.add(new Vector3(0, 20, 0)),
					shipPosition,
					Vector3.zAxis.mul(-1),
				);
			}
		},
	},
});
