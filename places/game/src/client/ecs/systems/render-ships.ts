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

				if (ship && transform) {
					const model = new Instance("Part");
					model.Name = ship?.name;
					model.Anchored = true;
					model.CanCollide = false;
					model.CanTouch = false;
					model.CanQuery = false;
					model.Size = Vector3.one;
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
				let newShipRender = shipRender;

				if (newShipRender) {
					if (
						isNewFrame &&
						(newShipRender.currentTransform !== transform || newShipRender.previousTransform !== transform)
					) {
						newShipRender = {
							...newShipRender,
							currentTransform: transform,
							previousTransform: newShipRender.currentTransform,
						};

						world.set(entity, clientComponents.shipRender, newShipRender);
					} else if (newShipRender.currentTransform === newShipRender.previousTransform) continue;

					const renderCFrame = newShipRender.previousTransform.Lerp(newShipRender.currentTransform, blend);

					bulkMoveToParts.push(newShipRender.model);
					bulkMoveToCFrames.push(renderCFrame);
				}
			}

			if (bulkMoveToParts.size() > 0)
				Workspace.BulkMoveTo(bulkMoveToParts, bulkMoveToCFrames, Enum.BulkMoveMode.FireCFrameChanged);

			lastFrame = frame;
		},
	},
});
