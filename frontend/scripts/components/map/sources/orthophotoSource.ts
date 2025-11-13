import { BaseSource } from "./baseSource";
import { ORTHOPHOTO_TILES_URL } from "../constants/config";

export class OrthophotoSource extends BaseSource {
    constructor() {
        super({
            id: "orthophoto-source",
            type: "raster",
        });
    }

    getOptions() {
        return {
            type: "raster" as const,
            tiles: [ORTHOPHOTO_TILES_URL],
            tileSize: 256,
        };
    }
}
