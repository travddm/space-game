import { Players, Workspace } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");

export const modelContainer = new Instance("Folder");
modelContainer.Name = "Models";
modelContainer.Archivable = false;
modelContainer.Parent = Workspace;

export const nametagContainer = new Instance("Folder");
nametagContainer.Name = "Nametags";
nametagContainer.Archivable = false;
nametagContainer.Parent = playerGui;

export const vfxContainer = new Instance("Folder");
vfxContainer.Name = "VFX";
vfxContainer.Archivable = false;
vfxContainer.Parent = Workspace;
