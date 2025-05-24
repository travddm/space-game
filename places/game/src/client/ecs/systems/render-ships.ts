import { Workspace } from "@rbxts/services";

import { Entity } from "@rbxts/jecs";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";
import { monitor } from "shared/ecs/monitor";

import { clientComponents } from "../components";
import { shipContainer } from "../containers";

const shipMonitor = monitor(components.ship);
const movableShips = world.query(components.transform, clientComponents.shipRender).with(components.ship).cached();

const shipModels = new Map<Entity, BasePart>();

const bulkMoveToParts = new Array<BasePart>();
const bulkMoveToCFrames = new Array<CFrame>();

let lastFrame = 0;

export const renderShipsSystem = createSystem({
	name: "render-ships",
	callbacks: {
		[SystemCallbackType.OnRender]: (deltaTime, frame, blend) => {
			const isNewFrame = frame !== lastFrame;

			bulkMoveToParts.clear();
			bulkMoveToCFrames.clear();

			// add ships
			for (const entity of shipMonitor.added()) {
				const [ship, transform] = world.get(entity, components.ship, components.transform);

				if (ship !== undefined && transform) {
					const model = new Instance("Part");
					model.Name = tostring(entity);
					model.Anchored = true;
					model.CanCollide = false;
					model.CanTouch = false;
					model.CanQuery = false;
					model.Material = Enum.Material.DiamondPlate;
					model.Size = new Vector3(0.5, 0.5, 1);
					model.CFrame = transform;
					model.Parent = shipContainer;

					world.set(entity, clientComponents.shipRender, {
						model: model,
						currentTransform: transform,
						previousTransform: transform,
					});

					shipModels.set(entity, model);
				}
			}

			// remove ships
			for (const entity of shipMonitor.removed()) {
				const shipModel = shipModels.get(entity);

				if (shipModel) {
					shipModels.delete(entity);
					shipModel.Destroy();
				}
			}

			// update ships
			for (const [entity, transform, shipRender] of movableShips) {
				const model = shipRender.model;

				let currentTransform = shipRender.currentTransform;
				let previousTransform = shipRender.previousTransform;

				if (isNewFrame && (currentTransform !== transform || previousTransform !== transform)) {
					currentTransform = transform;
					previousTransform = shipRender.currentTransform;

					world.set(entity, clientComponents.shipRender, {
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
