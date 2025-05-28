import { Players, RunService } from "@rbxts/services";

import { Entity, Name, OnAdd, OnRemove, OnSet } from "@rbxts/jecs";

import { components, world } from "shared/ecs";

export const localComponent = world.entity();

world.set(localComponent, Name, "local");

const playerId = RunService.IsClient() ? tostring(Players.LocalPlayer?.UserId) : "server";

function onComponentChanged(entity: Entity) {
	const newPlayerId = world.get(entity, components.player);

	if (newPlayerId === playerId) world.add(entity, localComponent);
	else world.remove(entity, localComponent);
}

world.set(components.player, OnAdd, onComponentChanged);
world.set(components.player, OnSet, onComponentChanged);
world.set(components.player, OnRemove, onComponentChanged);
