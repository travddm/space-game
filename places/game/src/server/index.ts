import { log } from "common/shared/log";

import { fixedTimeStep, maxTimeStep } from "shared/constants";
import { systems } from "shared/ecs";

import { startScheduler } from "./ecs";
import { startPlayerManager } from "./player";

export function main() {
	log.info("Started initializing server");

	startScheduler({
		fixedTimeStep,
		maxTimeStep,
		systems,
	});
	startPlayerManager();

	log.info("Finished initializing server");
}
