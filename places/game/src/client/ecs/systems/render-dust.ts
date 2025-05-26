import { Workspace } from "@rbxts/services";

import { getIntersectionY } from "common/shared/util";

import { SystemCallbackType, createSystem } from "shared/ecs";

import { vfxContainer } from "client/containers";

import { renderCameraSystem } from "./render-camera";

const DUST_DEPTH = 40; // studs
const DUST_SPACING = 16; // studs
const DUST_SPEED = 1 / 10; // studs/sec
const DUST_VISUAL_SPEED = 1 / 100;
const DUST_RADIUS = 2.5; // pixels
const DUST_CACHED = 50; // max dust to cache
const CACHE_CFRAME = new CFrame(0, 0, -2048);

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

// ensure dust visual noise doesn't start at <1
let dustTime = 1 / DUST_VISUAL_SPEED;
let lastParticleRadius = 0;
let lastDustCounter = 0;

export const renderDustSystem = createSystem({
	name: "render-dust",
	dependencies: [renderCameraSystem],
	callbacks: {
		[SystemCallbackType.OnUpdate]: (deltaTime, frame, blend) => {
			dustTime += deltaTime;

			const camera = Workspace.CurrentCamera;

			if (camera) {
				const viewportSize = camera.ViewportSize;
				const cameraCFrame = camera.CFrame;
				const particleRadius = (DUST_RADIUS * cameraCFrame.Y) / viewportSize.Y;
				const rayTopLeft = camera.ViewportPointToRay(0, 0);
				const rayBottomRight = camera.ViewportPointToRay(viewportSize.X, viewportSize.Y);

				const boundOffset = new Vector3(0, DUST_DEPTH, 0);
				const boundTopLeft = getIntersectionY(rayTopLeft.Origin.add(boundOffset), rayTopLeft.Direction);
				const boundBottomRight = getIntersectionY(
					rayBottomRight.Origin.add(boundOffset),
					rayBottomRight.Direction,
				);

				const dustOffset = dustTime * DUST_SPEED;
				const dustOffsetFloor = math.floor(dustOffset / DUST_SPACING) * DUST_SPACING;
				const dustVisual = dustTime * DUST_VISUAL_SPEED;

				const minX =
					math.floor(math.min(boundTopLeft.X, boundBottomRight.X) / DUST_SPACING) * DUST_SPACING -
					dustOffsetFloor;
				const minZ =
					math.floor(math.min(boundTopLeft.Z, boundBottomRight.Z) / DUST_SPACING) * DUST_SPACING -
					dustOffsetFloor;
				const maxX =
					math.ceil(math.max(boundTopLeft.X, boundBottomRight.X) / DUST_SPACING) * DUST_SPACING -
					dustOffsetFloor;
				const maxZ =
					math.ceil(math.max(boundTopLeft.Z, boundBottomRight.Z) / DUST_SPACING) * DUST_SPACING -
					dustOffsetFloor;

				let dustCounter = 0;

				for (let x = minX; x <= maxX; x += DUST_SPACING) {
					for (let z = minZ; z <= maxZ; z += DUST_SPACING) {
						const xn = x * math.pi * 10;
						const zn = z * math.pi * 10;

						const xOffset = math.noise(xn, zn) * DUST_SPACING;
						const zOffset = math.noise(zn, xn) * DUST_SPACING;
						const height = (math.noise(zn, xn, dustVisual) + 1) * 0.5 * DUST_DEPTH;

						let particle = dustParticles[dustCounter];

						if (!particle) {
							particle = new Instance("SphereHandleAdornment");
							particle.Name = "Dust";
							particle.Adornee = adornee;
							particle.Radius = particleRadius;
							particle.Transparency = 0.2;
							particle.Color3 = new Color3(1, 1, 1);
							particle.Parent = adornee;

							dustParticles.push(particle);
						}

						particle.CFrame = new CFrame(
							x + dustOffset + xOffset,
							height - DUST_DEPTH,
							z + dustOffset + zOffset,
						);

						dustCounter++;
					}
				}

				if (particleRadius !== lastParticleRadius) {
					lastParticleRadius = particleRadius;

					for (const particle of dustParticles) particle.Radius = particleRadius;
				}

				const numParticles = dustParticles.size();
				const newCachedDust = math.clamp(lastDustCounter - dustCounter, 0, DUST_CACHED);
				for (let i = 0; i < numParticles - dustCounter; i++) {
					if (i >= DUST_CACHED) dustParticles.pop()?.Destroy();
					else if (i < newCachedDust) dustParticles[dustCounter + i].CFrame = CACHE_CFRAME;
				}

				lastDustCounter = dustCounter;
			}
		},
	},
});
