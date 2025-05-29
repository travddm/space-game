import { log } from "common/log";

import { fixedTimeStep, maxTimeStep } from "shared/constants";

import { clientSystems, startScheduler } from "./ecs";
import { flushInput, startInputManager } from "./input";

export function main() {
	log.info("Started initializing client");

	startScheduler({
		fixedTimeStep,
		maxTimeStep,
		systems: clientSystems,
		flushInput,
	});
	startInputManager();

	log.info("Finished initializing client");
}
