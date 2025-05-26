import { Workspace } from "@rbxts/services";

import { Entity } from "@rbxts/jecs";

import { SystemCallbackType, components, createSystem, monitor, world } from "shared/ecs";

import { nametagContainer } from "client/containers";

import { clientComponents } from "../components";
import { renderCameraSystem } from "./render-camera";

const NAMETAG_FONT = new Font("rbxasset://fonts/families/FredokaOne.json");
const NAMETAG_MARGIN = 8; // pixels

const nametagMonitor = monitor(components.nametag);
const renderedNametags = world.query(clientComponents.modelRender, clientComponents.nametagRender).cached();

const nametags = new Map<Entity, Frame>();

export const renderNametagSystem = createSystem({
	name: "render-nametags",
	dependencies: [renderCameraSystem],
	callbacks: {
		[SystemCallbackType.OnUpdate]: (deltaTime, frame, blend) => {
			const camera = Workspace.CurrentCamera;

			if (camera) {
				// add nametags
				for (const entity of nametagMonitor.added()) {
					const [modelRender, nametag] = world.get(entity, clientComponents.modelRender, components.nametag);

					if (modelRender && nametag) {
						const nametagFrame = new Instance("Frame");
						nametagFrame.Name = tostring(entity);
						nametagFrame.AnchorPoint = new Vector2(0.5, 0);
						nametagFrame.Size = UDim2.fromOffset(256, 0);
						nametagFrame.Visible = false;
						nametagFrame.BackgroundTransparency = 1;
						nametagFrame.Parent = nametagContainer;

						const nameText = new Instance("TextLabel");
						nameText.Size = new UDim2(1, 0, 0, 16);
						nameText.Text = nametag.name;
						nameText.TextColor3 = new Color3(0.8, 0.8, 0.8);
						nameText.FontFace = NAMETAG_FONT;
						nameText.TextScaled = true;
						nameText.BackgroundTransparency = 1;
						nameText.Parent = nametagFrame;

						const nameTextStroke = new Instance("UIStroke");
						nameTextStroke.Color = new Color3();
						nameTextStroke.Transparency = 0;
						nameTextStroke.Parent = nameText;

						const modelSize = modelRender.model.Size;

						world.set(entity, clientComponents.nametagRender, {
							hidden: true,
							offset: new Vector3(0, 0, math.max(modelSize.X, modelSize.Y, modelSize.Z) / 2),
						});

						nametags.set(entity, nametagFrame);
					}
				}

				// remove nametags
				for (const entity of nametagMonitor.removed()) {
					const nametag = nametags.get(entity);

					if (nametag) {
						nametag.Destroy();
						nametags.delete(entity);
					}

					if (world.has(entity, clientComponents.nametagRender))
						world.remove(entity, clientComponents.nametagRender);
				}

				// move nametags
				for (const [entity, modelRender, nametagRender] of renderedNametags) {
					const nametag = nametags.get(entity);
					const isHidden = nametagRender.hidden;
					const offset = nametagRender.offset;
					const [position, onScreen] = camera.WorldToViewportPoint(modelRender.model.Position.add(offset));

					if (!nametag) continue;

					if (onScreen) {
						if (isHidden) {
							nametag.Visible = true;

							world.set(entity, clientComponents.nametagRender, {
								hidden: false,
								offset,
							});
						}

						nametag.Position = UDim2.fromOffset(position.X, position.Y + NAMETAG_MARGIN);
					} else if (!isHidden) {
						nametag.Visible = false;

						world.set(entity, clientComponents.nametagRender, {
							hidden: true,
							offset,
						});
					}
				}
			}
		},
	},
});
