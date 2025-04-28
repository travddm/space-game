import { Players } from "@rbxts/services";

import { log } from "common/shared/log";

import { queueAction, startScheduler } from "shared/ecs";

import { clientSystems } from "./ecs";
import { startInputHandler } from "./input";

export function main() {
	log.info("Started initializing client");

	startScheduler(clientSystems);
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
			cframe: CFrame.identity,
			movable: {
				moveSpeed: 5,
				moveDirection: Vector3.zero,
			},
			ship: {
				name: "Big Gamer",
			},
		},
	});

	for (let i = 0; i < 100; i++)
		queueAction("addEntity", {
			entityId: i + 1,
			components: {
				cframe: new CFrame(math.random(-100, 100), 0, math.random(-100, 100)),
				movable: {
					moveSpeed: 5,
					moveDirection: Vector3.zero,
				},
				ship: {
					name: `Big Gamer # ${i}`,
				},
			},
		});
}
