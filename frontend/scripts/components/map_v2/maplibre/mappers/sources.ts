import maplibregl from "maplibre-gl";

export const createSourcesMapper = () => ({
    addSource: (map: maplibregl.Map, sourceConfig: any) => {
        const { id, ...config } = sourceConfig;
        const existing = map.getSource(id);
        if (!existing) {
            map.addSource(id, config as any);
        }
    },

    removeSource: (map: maplibregl.Map, sourceId: string) => {
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    },

    updateSource: (map: maplibregl.Map, sourceId: string, sourceConfig: any) => {
        const source = map.getSource(sourceId);
        if (source && source.type === "geojson") {
            (source as maplibregl.GeoJSONSource).setData(sourceConfig.data);
        }
    },
});
