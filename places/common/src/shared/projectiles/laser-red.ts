import assets from "../assets";
import { ProjectileType } from "./projectile-type";

export const laserRed: ProjectileType = {
	assetId: assets["images/projectiles/laser-bullet.png"],
	color: new Color3(1, 0.2, 0.2),
};
