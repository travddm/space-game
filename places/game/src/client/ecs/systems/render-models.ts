import { Workspace } from "@rbxts/services";

import { Entity } from "@rbxts/jecs";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";
import { monitor } from "shared/ecs/monitor";

import { modelContainer } from "client/containers";

import { clientComponents } from "../components";

const modelMonitor = monitor(components.model);
const renderedModels = world.query(components.transform, clientComponents.modelRender).cached();

const models = new Map<Entity, BasePart>();

const bulkMoveToParts = new Array<BasePart>();
const bulkMoveToCFrames = new Array<CFrame>();

let lastFrame = 0;

export const renderModelsSystem = createSystem({
	name: "render-models",
	callbacks: {
		[SystemCallbackType.OnUpdate]: (deltaTime, frame, blend) => {
			const isNewFrame = frame !== lastFrame;

			bulkMoveToParts.clear();
			bulkMoveToCFrames.clear();

			// add models
			for (const entity of modelMonitor.added()) {
				const [model, transform] = world.get(entity, components.model, components.transform);

				if (model !== undefined && transform) {
					const renderModel = new Instance("Part");
					renderModel.Name = tostring(entity);
					renderModel.Anchored = true;
					renderModel.CanCollide = false;
					renderModel.CanTouch = false;
					renderModel.CanQuery = false;
					renderModel.Material = Enum.Material.DiamondPlate;
					renderModel.Size = new Vector3(0.5, 0.5, 1);
					renderModel.CFrame = transform;
					renderModel.Parent = modelContainer;

					world.set(entity, clientComponents.modelRender, {
						model: renderModel,
						currentTransform: transform,
						previousTransform: transform,
					});

					models.set(entity, renderModel);
				}
			}

			// remove models
			for (const entity of modelMonitor.removed()) {
				const renderModel = models.get(entity);

				if (renderModel) {
					models.delete(entity);
					renderModel.Destroy();
				}
			}

			// update models
			for (const [entity, transform, modelRender] of renderedModels) {
				const model = modelRender.model;

				let currentTransform = modelRender.currentTransform;
				let previousTransform = modelRender.previousTransform;

				if (isNewFrame && (currentTransform !== transform || previousTransform !== transform)) {
					currentTransform = transform;
					previousTransform = modelRender.currentTransform;

					world.set(entity, clientComponents.modelRender, {
						model,
						currentTransform,
						previousTransform,
					});
				} else if (currentTransform === previousTransform) continue;

				const renderCFrame = previousTransform.Lerp(currentTransform, blend);

				bulkMoveToParts.push(model);
				bulkMoveToCFrames.push(renderCFrame);
			}

			if (bulkMoveToParts.size() > 0)
				Workspace.BulkMoveTo(bulkMoveToParts, bulkMoveToCFrames, Enum.BulkMoveMode.FireCFrameChanged);

			lastFrame = frame;
		},
	},
});
