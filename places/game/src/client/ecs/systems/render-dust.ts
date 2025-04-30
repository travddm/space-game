import { Workspace } from "@rbxts/services";

import { getIntersectionY } from "common/shared/util";

import { SystemCallbackType, createSystem } from "shared/ecs";

import { vfxContainer } from "../containers";

const DUST_DEPTH = 20; // studs
const DUST_SPACING = 2; // studs
const DUST_SPEED = 1 / 10; // studs/sec
const DUST_VISUAL_SPEED = 1 / 100;

const adornee = new Instance("Part");
adornee.Name = "TurnToDust";
adornee.Anchored = true;
adornee.CanCollide = false;
adornee.CanTouch = false;
adornee.CanQuery = false;
adornee.Size = Vector3.one;
adornee.CFrame = new CFrame(Vector3.zero);
adornee.Transparency = 1;
adornee.Parent = vfxContainer;

const dustParticles = new Array<SphereHandleAdornment>();

let time = 0;

export const renderDustSystem = createSystem({
	name: "render-dust",
	callbacks: {
		[SystemCallbackType.OnRender]: (deltaTime, frame, blend) => {
			time += deltaTime;

			const camera = Workspace.CurrentCamera;

			if (camera) {
				const viewportSize = camera.ViewportSize;
				const rayTopLeft = camera.ViewportPointToRay(0, 0);
				const rayBottomRight = camera.ViewportPointToRay(viewportSize.X, viewportSize.Y);

				const boundOffset = new Vector3(0, DUST_DEPTH, 0);
				const boundTopLeft = getIntersectionY(rayTopLeft.Origin.add(boundOffset), rayTopLeft.Direction);
				const boundBottomRight = getIntersectionY(
					rayBottomRight.Origin.add(boundOffset),
					rayBottomRight.Direction,
				);

				const minX = math.floor(math.min(boundTopLeft.X, boundBottomRight.X) / DUST_SPACING) * DUST_SPACING;
				const minZ = math.floor(math.min(boundTopLeft.Z, boundBottomRight.Z) / DUST_SPACING) * DUST_SPACING;
				const maxX = math.ceil(math.max(boundTopLeft.X, boundBottomRight.X) / DUST_SPACING) * DUST_SPACING;
				const maxZ = math.ceil(math.max(boundTopLeft.Z, boundBottomRight.Z) / DUST_SPACING) * DUST_SPACING;

				const dustOffset = time * DUST_SPEED;
				const dustOffsetFloor = math.floor(dustOffset / DUST_SPACING) * DUST_SPACING;
				const dustVisual = time * DUST_VISUAL_SPEED;

				let dustCounter = 0;

				for (let x = minX - dustOffsetFloor; x <= maxX - dustOffsetFloor; x += DUST_SPACING) {
					for (let z = minZ - dustOffsetFloor; z <= maxZ - dustOffsetFloor; z += DUST_SPACING) {
						const xn = x * math.pi;
						const zn = z * math.pi;

						if (math.noise(xn, zn) < 0.5) continue;

						const transparency = (math.noise(xn, zn, dustVisual) + 1) / 2;
						const height = (math.noise(zn, xn, dustVisual) + 1) * 0.5 * DUST_DEPTH;

						let particle = dustParticles[dustCounter];

						if (!particle) {
							particle = new Instance("SphereHandleAdornment");
							particle.Name = "Dust";
							particle.Adornee = adornee;
							particle.Radius = 1 / 30;
							particle.Color3 = new Color3(1, 1, 1);
							particle.Parent = adornee;

							dustParticles.push(particle);
						}

						if (particle.Transparency !== transparency) particle.Transparency = transparency;

						particle.CFrame = new CFrame(x + dustOffset, height - DUST_DEPTH, z + dustOffset);

						dustCounter++;
					}
				}

				for (let i = 0; i < dustParticles.size() - dustCounter; i++) dustParticles.pop()?.Destroy();
			}
		},
	},
});
