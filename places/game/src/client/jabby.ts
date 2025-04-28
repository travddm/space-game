import jabby from "@rbxts/jabby";

export const client = jabby.obtain_client();

export let closeJabby: (() => void) | undefined;

export function toggleJabby() {
	if (closeJabby !== undefined) {
		closeJabby();
		closeJabby = undefined;
	} else closeJabby = client.spawn_app(client.apps.home);
}
