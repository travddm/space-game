import { System } from "./system";

export interface SchedulerConfig {
	readonly fixedTimeStep: number;
	readonly maxTimeStep: number;
	readonly systems: System[];
}
