import { Workspace } from "@rbxts/services";

import { SystemCallbackType, createSystem, world } from "shared/ecs";

import { clientComponents } from "../components";
import { ModelRender } from "../components/model-render";
import { renderModelsSystem } from "./render-models";

const localRenderedModels = world.query(clientComponents.modelRender).with(clientComponents.local).cached();
const remoteRenderedModels = world.query(clientComponents.modelRender).without(clientComponents.local).cached();

// todo: this is kinda goofy, maybe find a more efficient way?
function isVisible(camera: Camera, modelRender: ModelRender) {
	const currentPosition = modelRender.currentTransform.Position;
	const radius = modelRender.radius;

	let [_, onScreen] = camera.WorldToViewportPoint(currentPosition.add(new Vector3(radius, -radius)));
	if (onScreen) return true;

	[_, onScreen] = camera.WorldToViewportPoint(currentPosition.add(new Vector3(-radius, -radius)));
	if (onScreen) return true;

	[_, onScreen] = camera.WorldToViewportPoint(currentPosition.add(new Vector3(0, -radius, radius)));
	if (onScreen) return true;

	[_, onScreen] = camera.WorldToViewportPoint(currentPosition.add(new Vector3(0, -radius, -radius)));
	if (onScreen) return true;

	return false;
}

export const renderCameraSystem = createSystem({
	name: "render-camera",
	dependencies: [renderModelsSystem],
	callbacks: {
		[SystemCallbackType.OnUpdate]: (deltaTime, frame, blend) => {
			const camera = Workspace.CurrentCamera;

			if (camera) {
				let modelPosition = Vector3.zero;
				for (const [_, modelRender] of localRenderedModels) {
					modelPosition = modelRender.model.Position;
					break;
				}

				camera.CFrame = CFrame.lookAt(
					modelPosition.add(new Vector3(0, 20, 0)),
					modelPosition,
					Vector3.zAxis.mul(-1),
				);

				for (const [entity, modelRender] of remoteRenderedModels) {
					const visible = isVisible(camera, modelRender);

					if (modelRender.visible !== visible)
						world.set(entity, clientComponents.modelRender, {
							...modelRender,
							visible,
						});
				}

				if (camera.CameraType !== Enum.CameraType.Scriptable) camera.CameraType = Enum.CameraType.Scriptable;
			}
		},
	},
});
