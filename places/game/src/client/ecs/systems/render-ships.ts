import { Workspace } from "@rbxts/services";

import { Entity } from "@rbxts/jecs";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";
import { monitor } from "shared/ecs/monitor";

import { clientComponents } from "../components";
import { shipContainer } from "../containers";

const shipMonitor = monitor(components.ship);
const movableShips = world.query(components.cframe, clientComponents.shipRender).with(components.ship).cached();

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
				const [ship, cframe] = world.get(entity, components.ship, components.cframe);

				if (ship && cframe) {
					const model = new Instance("Part");
					model.Name = ship?.name;
					model.Anchored = true;
					model.CanCollide = false;
					model.CanTouch = false;
					model.CanQuery = false;
					model.Size = Vector3.one;
					model.CFrame = cframe;
					model.Parent = shipContainer;

					shipModels.set(entity, model);

					world.set(entity, clientComponents.shipRender, {
						currentCFrame: cframe,
						previousCFrame: cframe,
					});
				}
			}

			// remove ships
			for (const entity of shipMonitor.removed()) {
				const model = shipModels.get(entity);

				if (model) {
					shipModels.delete(entity);
					model.Destroy();
				}
			}

			// update ships
			for (const [entity, cframe, shipRender] of movableShips) {
				const shipModel = shipModels.get(entity);
				let newShipRender = shipRender;

				if (shipModel && shipRender) {
					if (isNewFrame && (shipRender.currentCFrame !== cframe || shipRender.previousCFrame !== cframe)) {
						newShipRender = {
							currentCFrame: cframe,
							previousCFrame: shipRender.currentCFrame,
						};

						world.set(entity, clientComponents.shipRender, newShipRender);

						if (newShipRender.currentCFrame === newShipRender.previousCFrame) {
							bulkMoveToParts.push(shipModel);
							bulkMoveToCFrames.push(cframe);

							continue;
						}
					} else if (newShipRender.currentCFrame === newShipRender.previousCFrame) continue;

					const newCFrame = newShipRender.previousCFrame.Lerp(newShipRender.currentCFrame, blend);

					bulkMoveToParts.push(shipModel);
					bulkMoveToCFrames.push(newCFrame);
				}
			}

			if (bulkMoveToParts.size() > 0)
				Workspace.BulkMoveTo(bulkMoveToParts, bulkMoveToCFrames, Enum.BulkMoveMode.FireCFrameChanged);

			lastFrame = frame;
		},
	},
});
