export enum LogLevel {
	Critical,
	Error,
	Warn,
	Info,
	Debug,
}

export interface LogOptions {
	logLevel?: LogLevel;
}

export class Log implements LogOptions {
	public logLevel: LogLevel;

	constructor(logOptions?: LogOptions) {
		this.logLevel = logOptions?.logLevel ?? LogLevel.Debug;
	}

	/**
	 * If the `Log.logLevel` is at least `LogLevel.Debug`, print the list of parameters to the output
	 * @returns A boolean indicating whether or not `Log.logLevel` was high enough
	 */
	public debug(...params: Array<unknown>) {
		if (this.logLevel >= LogLevel.Debug) {
			print("[DEBUG]", ...params);

			return true;
		}

		return false;
	}

	/**
	 * If the `Log.logLevel` is at least `LogLevel.Info`, print the list of parameters to the output
	 * @returns A boolean indicating whether or not `Log.logLevel` was high enough
	 */
	public info(...params: Array<unknown>) {
		if (this.logLevel >= LogLevel.Info) {
			print("[INFO]", ...params);

			return true;
		}

		return false;
	}

	/**
	 * If the `Log.logLevel` is at least `LogLevel.Warn`, print the list of parameters to the output
	 * @returns A boolean indicating whether or not `Log.logLevel` was high enough
	 */
	public warn(...params: Array<unknown>) {
		if (this.logLevel >= LogLevel.Warn) {
			warn("[WARN]", ...params);

			return true;
		}

		return false;
	}

	/**
	 * Terminates the last protected function called and outputs message as an error message. If the function
	 * containing the error is not called in a protected function (pcall), then the script which called the function
	 * will terminate. The error function itself never returns and acts like a script error. The level argument
	 * specifies how to get the error position. With level 1 (the default), the error position is where the error
	 * function was called. Level 2 points the error to where the function that called error was called; and so on.
	 * Passing a level 0 avoids the addition of error position information to the message.
	 * @throws
	 */
	public error(message?: unknown, level?: number): never {
		error("[ERROR]" + tostring(message), level !== undefined ? (level === 0 ? level : level + 1) : 2);
	}

	/**
	 * Terminates the last protected function called and outputs message as a critical error message. If the function
	 * containing the error is not called in a protected function (pcall), then the script which called the function
	 * will terminate. The error function itself never returns and acts like a script error. The level argument
	 * specifies how to get the error position. With level 1 (the default), the error position is where the error
	 * function was called. Level 2 points the error to where the function that called error was called; and so on.
	 * Passing a level 0 avoids the addition of error position information to the message.
	 * @throws
	 */
	public critical(message?: unknown, level?: number): never {
		error("[CRITICAL]" + tostring(message), level !== undefined ? (level === 0 ? level : level + 1) : 2);
	}
}

export const log = new Log();
