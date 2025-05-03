import jabby from "@rbxts/jabby";
import { Scheduler } from "@rbxts/jabby/out/jabby/modules/types";

import { System } from "./system";
import { world } from "./world";

export interface SchedulerConfig {
	readonly fixedTimeStep: number;
	readonly maxTimeStep: number;
	readonly systems: System[];
}

let scheduler: Scheduler | undefined;

export function getScheduler() {
	if (!scheduler) {
		scheduler = jabby.scheduler.create();

		jabby.register({
			applet: jabby.applets.world,
			name: "all",
			configuration: {
				world,
			},
		});
		jabby.register({
			applet: jabby.applets.scheduler,
			name: "all",
			configuration: {
				scheduler,
			},
		});
	}

	return scheduler;
}
