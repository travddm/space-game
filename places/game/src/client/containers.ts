import { Players, Workspace } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");

export const modelContainer = new Instance("Folder");
modelContainer.Name = "Models";
modelContainer.Archivable = false;
modelContainer.Parent = Workspace;

export const vfxContainer = new Instance("Folder");
vfxContainer.Name = "VFX";
vfxContainer.Archivable = false;
vfxContainer.Parent = Workspace;

export const nametagContainer = new Instance("ScreenGui");
nametagContainer.Name = "Nametags";
nametagContainer.Archivable = false;
nametagContainer.ResetOnSpawn = false;
nametagContainer.IgnoreGuiInset = true;
nametagContainer.Parent = playerGui;
