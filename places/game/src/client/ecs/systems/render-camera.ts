import { Workspace } from "@rbxts/services";

import { SystemCallbackType, createSystem, world } from "shared/ecs";

import { clientComponents } from "../components";

const localModels = world.query(clientComponents.modelRender).with(clientComponents.local).cached();

export const renderCameraSystem = createSystem({
	name: "render-camera",
	callbacks: {
		[SystemCallbackType.OnRender]: (deltaTime, frame, blend) => {
			const camera = Workspace.CurrentCamera;

			if (camera) {
				let modelPosition = Vector3.zero;
				for (const [_, modelRender] of localModels) {
					modelPosition = modelRender.model.Position;
					break;
				}

				camera.CFrame = CFrame.lookAt(
					modelPosition.add(new Vector3(0, 20, 0)),
					modelPosition,
					Vector3.zAxis.mul(-1),
				);

				if (camera.CameraType !== Enum.CameraType.Scriptable) camera.CameraType = Enum.CameraType.Scriptable;
			}
		},
	},
});
