import { Workspace } from "@rbxts/services";

export const modelContainer = new Instance("Folder");
modelContainer.Name = "Models";
modelContainer.Archivable = false;
modelContainer.Parent = Workspace;

export const vfxContainer = new Instance("Folder");
vfxContainer.Name = "VFX";
vfxContainer.Archivable = false;
vfxContainer.Parent = Workspace;
