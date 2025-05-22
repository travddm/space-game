import { Players } from "@rbxts/services";

import { components, getEntityId, nextEntityId, queueAction, world } from "shared/ecs";

const playerEntities = world.query(components.player).cached();

export function startPlayerManager() {
	function onPlayerAdded(player: Player) {
		const playerId = tostring(player.UserId);

		queueAction("addEntity", {
			entityId: nextEntityId(),
			components: {
				player: playerId,
				transform: CFrame.identity,
				movable: {
					moveSpeed: 10,
					moveDirection: Vector3.zero,
					moveVelocity: Vector3.zero,
					rotateSpeed: math.rad(540),
					rotateDirection: Vector3.xAxis,
				},
				ship: {
					name: player.DisplayName,
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
