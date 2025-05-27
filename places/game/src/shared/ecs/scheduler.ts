import { RunService } from "@rbxts/services";

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

		if (RunService.IsStudio()) jabby.set_check_function(() => true);
		else if (game.CreatorType === Enum.CreatorType.User)
			jabby.set_check_function((player) => player.UserId === game.CreatorId);
		else jabby.set_check_function((player) => player.GetRankInGroup(game.CreatorId) === 255);
	}

	return scheduler;
}
