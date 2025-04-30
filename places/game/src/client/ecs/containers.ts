import { Workspace } from "@rbxts/services";

export const shipContainer = new Instance("Folder");
shipContainer.Name = "Ships";
shipContainer.Archivable = false;
shipContainer.Parent = Workspace;

export const vfxContainer = new Instance("Folder");
vfxContainer.Name = "VFX";
vfxContainer.Archivable = false;
vfxContainer.Parent = Workspace;
