import { Workspace } from "@rbxts/services";

import { ProjectileTypeId, projectileTypes } from "common/projectiles";
import { getIntersectionY } from "common/util";

import { SystemCallbackType, components, createSystem, world } from "shared/ecs";
import { monitor } from "shared/ecs/monitor";

import { vfxContainer } from "client/containers";

import { clientComponents } from "../components";
import { renderCameraSystem } from "./render-camera";

const PROJECTILE_ROTATION = CFrame.fromOrientation(math.rad(90), 0, 0);
const PROJECTILE_CACHED = 20;
const CACHE_CFRAME = new CFrame(0, 0, -2048);

const adornee = new Instance("Part");
adornee.Name = "Projectiles";
adornee.Anchored = true;
adornee.CanCollide = false;
adornee.CanTouch = false;
adornee.CanQuery = false;
adornee.Size = Vector3.one;
adornee.CFrame = new CFrame(Vector3.zero);
adornee.Transparency = 1;
adornee.Parent = vfxContainer;

const projectileTypeCache = new Map<ProjectileTypeId, ImageHandleAdornment[]>();

const projectileMonitor = monitor(components.projectile);
const renderedModels = world
	.query(components.transform, components.projectile, clientComponents.projectileRender)
	.cached();

let lastFrame = 0;
let lastProjectileCounters = new Map<ProjectileTypeId, number>();

export const renderProjectilesSystem = createSystem({
	name: "render-projectiles",
	dependencies: [renderCameraSystem],
	callbacks: {
		[SystemCallbackType.OnUpdate]: (deltaTime, frame, blend) => {
			const camera = Workspace.CurrentCamera;

			// add render data
			for (const entity of projectileMonitor.added()) {
				const [projectile, transform] = world.get(entity, components.projectile, components.transform);

				if (projectile && transform) {
					const rotatedTransform = transform.mul(PROJECTILE_ROTATION);

					world.set(entity, clientComponents.projectileRender, {
						currentTransform: rotatedTransform,
						previousTransform: rotatedTransform,
					});
				}
			}

			// remove render data
			for (const entity of projectileMonitor.removed()) world.remove(entity, clientComponents.projectileRender);

			if (camera) {
				const isNewFrame = frame !== lastFrame;

				const viewportSize = camera.ViewportSize;
				const rayTopLeft = camera.ViewportPointToRay(0, 0);
				const rayBottomRight = camera.ViewportPointToRay(viewportSize.X, viewportSize.Y);

				const boundTopLeft = getIntersectionY(rayTopLeft.Origin, rayTopLeft.Direction);
				const boundBottomRight = getIntersectionY(rayBottomRight.Origin, rayBottomRight.Direction);

				const minX = math.min(boundTopLeft.X, boundBottomRight.X);
				const minZ = math.min(boundTopLeft.Z, boundBottomRight.Z);
				const maxX = math.max(boundTopLeft.X, boundBottomRight.X);
				const maxZ = math.max(boundTopLeft.Z, boundBottomRight.Z);

				const projectileCounters = new Map<ProjectileTypeId, number>();

				// update projectiles
				for (const [entity, transform, projectile, projectileRender] of renderedModels) {
					const typeId = projectile.typeId;
					const rotatedTransform = transform.mul(PROJECTILE_ROTATION);

					let currentTransform = projectileRender.currentTransform;
					let previousTransform = projectileRender.previousTransform;

					if (isNewFrame && (currentTransform !== transform || previousTransform !== transform)) {
						previousTransform = currentTransform;
						currentTransform = rotatedTransform;

						world.set(entity, clientComponents.projectileRender, {
							currentTransform,
							previousTransform,
						});
					}

					const pX = previousTransform.X;
					const pZ = previousTransform.Z;
					const cX = currentTransform.X;
					const cZ = currentTransform.Z;
					const visible =
						previousTransform !== currentTransform &&
						((cX >= minX && cX <= maxX && cZ >= minZ && cZ <= maxZ) ||
							(pX >= minX && pX <= maxX && pZ >= minZ && pZ <= maxZ));

					if (visible) {
						const renderCFrame = previousTransform.Lerp(currentTransform, blend);
						const projectileCounter = projectileCounters.get(typeId) ?? 0;

						let projectileCache = projectileTypeCache.get(typeId);

						if (!projectileCache) {
							projectileCache = [];

							projectileTypeCache.set(typeId, projectileCache);
						}

						let projectileInstance = projectileCache[projectileCounter];

						if (!projectileInstance) {
							const projectileType = projectileTypes[typeId];

							projectileInstance = new Instance("ImageHandleAdornment");
							projectileInstance.Name = tostring(typeId);
							projectileInstance.Image = projectileType.assetId;
							projectileInstance.Color3 = projectileType.color;
							projectileInstance.Size = projectileType.size;
							projectileInstance.Adornee = adornee;
							projectileInstance.Parent = adornee;

							projectileCache.push(projectileInstance);
						}

						projectileInstance.CFrame = renderCFrame;

						projectileCounters.set(typeId, projectileCounter + 1);
					}
				}

				// clean up cached projectiles
				for (const [typeId, projectileCache] of projectileTypeCache) {
					const lastProjectileCounter = lastProjectileCounters.get(typeId) ?? 0;
					const projectileCounter = projectileCounters.get(typeId) ?? 0;
					const numProjectiles = projectileCache.size();
					const newCachedProjectiles = math.clamp(
						lastProjectileCounter - projectileCounter,
						0,
						PROJECTILE_CACHED,
					);

					for (let i = 0; i < numProjectiles - projectileCounter; i++) {
						if (i >= PROJECTILE_CACHED) projectileCache.pop()?.Destroy();
						else if (i < newCachedProjectiles) projectileCache[projectileCounter + i].CFrame = CACHE_CFRAME;
					}
				}

				lastFrame = frame;
				lastProjectileCounters = projectileCounters;
			}
		},
	},
});
