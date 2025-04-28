import { log } from "common/shared/log";

import { startScheduler, systems } from "shared/ecs";

export function main() {
	log.info("Started initializing server");

	startScheduler(systems);

	log.info("Finished initializing server");
}
