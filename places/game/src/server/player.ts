import { Players } from "@rbxts/services";

import { components, getEntityId, queueAction, world } from "shared/ecs";

const playerEntities = world.query(components.player).cached();

export function startPlayerManager() {
	function onPlayerAdded(player: Player) {
		const playerId = tostring(player.UserId);

		queueAction("addEntity", {
			components: {
				player: playerId,
				transform: CFrame.identity,
				movable: {
					moveSpeed: 20,
					moveDirection: Vector3.zero,
					moveVelocity: Vector3.zero,
					rotateSpeed: math.rad(540),
					rotateDirection: Vector3.xAxis,
				},
				nametag: {
					name: player.DisplayName,
				},
				model: {
					modelId: "todo",
				},
			},
		});
	}

	function onPlayerRemoving(player: Player) {
		const playerId = tostring(player.UserId);

		for (const [entity, pid] of playerEntities)
			if (pid === playerId) {
				const entityId = getEntityId(entity);

				if (entityId !== undefined)
					queueAction("deleteEntity", {
						entityId,
					});
			}
	}

	Players.PlayerAdded.Connect(onPlayerAdded);
	Players.PlayerRemoving.Connect(onPlayerRemoving);
}
