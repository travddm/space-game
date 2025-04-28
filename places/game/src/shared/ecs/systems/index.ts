import { System } from "../system";
import { addEntitiesSystem } from "./add-entities";
import { deleteEntitiesSystem } from "./delete-entities";
import { moveEntitiesSystem } from "./move-entities";

export const systems: System[] = [addEntitiesSystem, deleteEntitiesSystem, moveEntitiesSystem];
