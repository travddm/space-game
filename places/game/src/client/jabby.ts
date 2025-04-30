import jabby from "@rbxts/jabby";

export const client = jabby.obtain_client();

export let closeJabby: (() => void) | undefined;

export function toggleJabby() {
	if (closeJabby !== undefined) {
		const [success] = pcall(closeJabby);

		closeJabby = undefined;

		if (success) return;
	}

	closeJabby = client.spawn_app(client.apps.home);
}
