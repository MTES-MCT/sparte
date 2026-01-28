import { BaseSource } from "./baseSource";
import { OSM_TILES_URL } from "../constants/config";

export class OsmSource extends BaseSource {
    constructor() {
        super({
            id: "osm-source",
            type: "raster",
        });
    }

    getOptions() {
        return {
            type: "raster" as const,
            tiles: [OSM_TILES_URL],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        };
    }
}
