import { Players } from "@rbxts/services";

import { log } from "common/shared/log";

import { queueAction, startScheduler } from "shared/ecs";

import { clientSystems } from "./ecs";
import { flushInputHandler, startInputHandler } from "./input";

export function main() {
	log.info("Started initializing client");

	startScheduler(clientSystems, flushInputHandler);
	startInputHandler();

	log.info("Finished initializing client");

	log.info("Running temp function");

	temp();

	log.info("Finished running temp function");
}

function temp() {
	queueAction("addEntity", {
		entityId: 0,
		components: {
			player: tostring(Players.LocalPlayer.UserId),
			transform: CFrame.identity,
			movable: {
				moveSpeed: 30,
				moveDirection: Vector3.zero,
				moveVelocity: Vector3.zero,
				rotateSpeed: math.rad(540),
				rotateDirection: Vector3.xAxis,
			},
			ship: {
				name: "Big Gamer",
			},
		},
	});
}
