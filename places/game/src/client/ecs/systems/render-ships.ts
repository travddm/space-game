import { Workspace } from "@rbxts/services";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";
import { monitor } from "shared/ecs/monitor";

import { clientComponents } from "../components";
import { shipContainer } from "../containers";

const shipMonitor = monitor(components.ship);
const movableShips = world.query(components.cframe, clientComponents.shipRender).with(components.ship).cached();

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

					world.set(entity, clientComponents.shipRender, {
						model: model,
						currentCFrame: cframe,
						previousCFrame: cframe,
					});
				}
			}

			// remove ships
			for (const entity of shipMonitor.removed())
				if (world.contains(entity)) world.remove(entity, clientComponents.shipRender);

			// update ships
			for (const [entity, cframe, shipRender] of movableShips) {
				let newShipRender = shipRender;

				if (newShipRender) {
					if (
						isNewFrame &&
						(newShipRender.currentCFrame !== cframe || newShipRender.previousCFrame !== cframe)
					) {
						newShipRender = {
							...newShipRender,
							currentCFrame: cframe,
							previousCFrame: newShipRender.currentCFrame,
						};

						world.set(entity, clientComponents.shipRender, newShipRender);
					} else if (newShipRender.currentCFrame === newShipRender.previousCFrame) continue;

					const renderCFrame = newShipRender.previousCFrame.Lerp(newShipRender.currentCFrame, blend);

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
