import { RunService } from "@rbxts/services";

import {
	ActionQueue,
	AnyActionData,
	SchedulerConfig,
	SystemCallbackType,
	actionQueue,
	getScheduler,
	registerSystems,
	world,
} from "shared/ecs";

export interface ClientSchedulerConfig extends SchedulerConfig {
	flushInput: () => void;
}

export function startScheduler(config: ClientSchedulerConfig) {
	const scheduler = getScheduler();
	const registeredSystems = registerSystems(scheduler, config.systems);
	const timeStep = config.fixedTimeStep;
	const maxTimeStep = config.maxTimeStep;
	const flushInput = config.flushInput;

	let frame = 0;
	let accumulator = 0;
	let blendFactor = 0;

	function sendClientSnapshot() {
		const actions = new Array<AnyActionData>();

		for (const [actionName, actionList] of pairs(actionQueue))
			for (const actionData of actionList)
				actions.push({
					name: actionName,
					data: actionData,
				} as AnyActionData);
	}

	function onHeartbeat(deltaTime: number) {
		const framePrevious = frame;

		let frameSteps = 0;

		deltaTime = math.min(deltaTime, maxTimeStep);
		accumulator += deltaTime;

		if (accumulator > 0) {
			frameSteps = math.floor(accumulator / timeStep);
			frame += frameSteps;
			accumulator -= frameSteps * timeStep;
		}

		for (let frameStep = 1; frameStep <= frameSteps; frameStep++) {
			const frameCurrent = framePrevious + frameStep;
			const isBehind = frameCurrent < frame;
			let actions: ActionQueue;

			if (!isBehind) {
				flushInput();
				sendClientSnapshot();
				actions = actionQueue;
			} else actions = {};

			for (const system of registeredSystems[SystemCallbackType.OnFixedUpdate])
				scheduler.run(system.id, system.callback, timeStep, frameCurrent, actions);

			if (actions === actionQueue) table.clear(actionQueue);
		}

		blendFactor = accumulator / timeStep;

		for (const system of registeredSystems[SystemCallbackType.OnUpdate])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	function onPreSimulation(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnPhysics])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	function onPreRender(deltaTime: number) {
		for (const system of registeredSystems[SystemCallbackType.OnRender])
			scheduler.run(system.id, system.callback, deltaTime, frame, blendFactor);
	}

	RunService.Heartbeat.Connect(onHeartbeat);
	RunService.PreSimulation.Connect(onPreSimulation);
	RunService.PreRender.Connect(onPreRender);
}
