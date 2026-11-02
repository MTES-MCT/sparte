import type { GeoJSONSourceSpecification, LayerSpecification, Map as MaplibreMap, SourceSpecification } from "maplibre-gl";
import type { LandDetailResultType } from "@services/types/land";
import { OcsgeSource } from "./ocsgeSource";
import { ZonageUrbanismeSource } from "./zonageUrbanismeSource";
import { OcsgeDiffSource } from "./ocsgeDiffSource";
import { OcsgeArtifDiffSource } from "./ocsgeArtifDiffSource";
import { OcsgeDiffCentroidSource } from "./ocsgeDiffCentroidSource";
import { OcsgeArtifDiffCentroidSource } from "./ocsgeArtifDiffCentroidSource";
import type { BaseMultiDepartementSource } from "./baseMultiDepartementSource";

/** Carte maplibre minimale : mémorise sources, couches et événements. */
class FakeMap {
    sources = new Map<string, SourceSpecification>();
    layers: LayerSpecification[] = [];
    events: string[] = [];

    addSource(id: string, options: SourceSpecification) { this.sources.set(id, options); }
    removeSource(id: string) { this.sources.delete(id); }
    getSource(id: string) { return this.sources.has(id) ? {} : undefined; }
    addLayer(spec: LayerSpecification) { this.layers.push(spec); }
    removeLayer(id: string) { this.layers = this.layers.filter(l => l.id !== id); }
    getLayer(id: string) { return this.layers.find(l => l.id === id); }
    getStyle() { return { layers: this.layers.map(l => ({ ...l })) }; }
    isSourceLoaded() { return true; }
    on() { /* rien */ }
    off() { /* rien */ }
    fire(event: string) { this.events.push(event); }

    asMap(): MaplibreMap { return this as unknown as MaplibreMap; }
    sourceIds(): string[] { return Array.from(this.sources.keys()); }
    layerIds(): string[] { return this.layers.map(l => l.id); }
    sourceLayerOf(layerId: string): string | undefined {
        return (this.getLayer(layerId) as { 'source-layer'?: string } | undefined)?.['source-layer'];
    }
}

const LOCATIONS = { vector_tiles_location: "https://tiles", geojson_location: "https://geo" };

/** Commune à cheval sur l'Ain (01) et le Jura (39) : le millésime 2 existe dans les deux. */
const twoDepartementsLand = {
    land_id: "01148",
    land_type: "COMM",
    departements: ["01", "39"],
    millesimes: [
        { index: 1, year: 2018, departement: "01" },
        { index: 2, year: 2021, departement: "01" },
        { index: 2, year: 2021, departement: "39" },
    ],
} as unknown as LandDetailResultType;

const singleDepartementLand = {
    land_id: "01148",
    land_type: "COMM",
    departements: ["01"],
    millesimes: [
        { index: 1, year: 2018, departement: "01" },
        { index: 2, year: 2021, departement: "01" },
    ],
} as unknown as LandDetailResultType;

const pmtiles = (name: string) => ({ type: "vector", url: `pmtiles://https://tiles/${name}.pmtiles` });

/** Monte la source sur une fausse carte avec une couche, comme le fait initMapFromConfig. */
const mount = (source: BaseMultiDepartementSource, sourceId: string, layer: Partial<LayerSpecification> = {}) => {
    const map = new FakeMap();
    source.setDataLocations(LOCATIONS);
    source.attach(map.asMap(), sourceId);
    map.addSource(sourceId, source.getOptions());
    map.addLayer({ id: `${sourceId}-layer`, type: "fill", source: sourceId, ...layer } as LayerSpecification);
    return map;
};

describe("Options de source par type", () => {
    it.each([
        ["OcsgeSource", () => new OcsgeSource(twoDepartementsLand), "occupation_du_sol_2_01"],
        ["ZonageUrbanismeSource", () => new ZonageUrbanismeSource(twoDepartementsLand), "zonage_urbanisme_2_01"],
        ["OcsgeDiffSource", () => new OcsgeDiffSource(twoDepartementsLand), "occupation_du_sol_diff_1_2_01"],
        ["OcsgeArtifDiffSource", () => new OcsgeArtifDiffSource(twoDepartementsLand), "artif_diff_1_2_01"],
    ])("%s pointe sur les tuiles du dernier millésime et du premier département", (_name, build, tileName) => {
        const source = build();
        source.setDataLocations(LOCATIONS);
        expect(source.getOptions()).toEqual(pmtiles(tileName));
    });

    it("OcsgeDiffCentroidSource agrège les surfaces imperméabilisées du territoire", () => {
        const source = new OcsgeDiffCentroidSource(twoDepartementsLand);
        source.setDataLocations(LOCATIONS);
        expect(source.getOptions()).toEqual({
            type: "geojson",
            data: "https://geo/occupation_du_sol_diff_centroid_1_2_01.geojson.gz",
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: ["all",
                ["==", ["get", "COMM"], "01148"],
                ["any", ["==", ["get", "new_is_impermeable"], true], ["==", ["get", "new_not_impermeable"], true]],
            ],
            clusterProperties: {
                impermeabilisation_count: ["+", ["case", ["==", ["get", "new_is_impermeable"], true], ["get", "surface"], 0]],
                desimpermeabilisation_count: ["+", ["case", ["==", ["get", "new_not_impermeable"], true], ["get", "surface"], 0]],
            },
        });
    });

    it("OcsgeArtifDiffCentroidSource agrège les surfaces artificialisées", () => {
        const source = new OcsgeArtifDiffCentroidSource(twoDepartementsLand);
        source.setDataLocations(LOCATIONS);
        const options = source.getOptions() as GeoJSONSourceSpecification;
        expect(options.data).toBe("https://geo/artif_diff_centroid_1_2_01.geojson.gz");
        expect(Object.keys(options.clusterProperties ?? {})).toEqual(["artificialisation_count", "desartificialisation_count"]);
        expect(options.filter).toEqual(["all",
            ["==", ["get", "COMM"], "01148"],
            ["any", ["==", ["get", "new_is_artificial"], true], ["==", ["get", "new_not_artificial"], true]],
        ]);
    });
});

describe("Sources supplémentaires par département", () => {
    it("ajoute une source et un clone de couche pour chaque autre département du millésime", () => {
        const source = new OcsgeSource(twoDepartementsLand);
        const map = mount(source, "ocsge-source", { "source-layer": "occupation_du_sol_2_01" } as Partial<LayerSpecification>);

        source.addExtraDepartmentSourcesOnInit();

        expect(map.sourceIds()).toEqual(["ocsge-source", "ocsge-source-dept-39"]);
        expect(map.sources.get("ocsge-source-dept-39")).toEqual(pmtiles("occupation_du_sol_2_39"));
        expect(map.layerIds()).toEqual(["ocsge-source-layer", "ocsge-source-layer-dept-39"]);
        expect(map.getLayer("ocsge-source-layer-dept-39")).toMatchObject({ type: "fill", source: "ocsge-source-dept-39" });
        expect(map.sourceLayerOf("ocsge-source-layer-dept-39")).toBe("occupation_du_sol_2_39");
    });

    it("n'ajoute rien pour un territoire sur un seul département", () => {
        const source = new ZonageUrbanismeSource(singleDepartementLand);
        const map = mount(source, "zonage-urbanisme-source");

        source.addExtraDepartmentSourcesOnInit();

        expect(map.sourceIds()).toEqual(["zonage-urbanisme-source"]);
        expect(map.layerIds()).toEqual(["zonage-urbanisme-source-layer"]);
    });

    it("les sources de différence utilisent la paire de millésimes dans le nom des tuiles", () => {
        const source = new OcsgeArtifDiffSource(twoDepartementsLand);
        const map = mount(source, "ocsge-artif-diff-source", { "source-layer": "artif_diff_1_2_01" } as Partial<LayerSpecification>);

        source.addExtraDepartmentSourcesOnInit();

        expect(map.sources.get("ocsge-artif-diff-source-dept-39")).toEqual(pmtiles("artif_diff_1_2_39"));
        expect(map.sourceLayerOf("ocsge-artif-diff-source-layer-dept-39")).toBe("artif_diff_1_2_39");
    });

    it("les centroïdes clonent la source GeoJSON et forcent le recalcul des clusters", () => {
        const source = new OcsgeDiffCentroidSource(twoDepartementsLand);
        const map = mount(source, "ocsge-diff-centroid-source");

        source.addExtraDepartmentSourcesOnInit();

        expect(map.sources.get("ocsge-diff-centroid-source-dept-39")).toMatchObject({
            type: "geojson",
            data: "https://geo/occupation_du_sol_diff_centroid_1_2_39.geojson.gz",
            cluster: true,
        });
        expect(map.layerIds()).toEqual(["ocsge-diff-centroid-source-layer", "ocsge-diff-centroid-source-layer-dept-39"]);
        expect(map.events).toEqual(["moveend"]);
    });

    it("les sources vectorielles ne déclenchent pas d'événement à l'initialisation", () => {
        const source = new OcsgeDiffSource(twoDepartementsLand);
        const map = mount(source, "ocsge-diff-source");

        source.addExtraDepartmentSourcesOnInit();

        expect(map.events).toEqual([]);
    });
});

describe("Changement de millésime", () => {
    it("recharge la source principale, met à jour le source-layer et retire les sources supplémentaires devenues inutiles", async () => {
        const source = new OcsgeSource(twoDepartementsLand);
        const map = mount(source, "ocsge-source", { "source-layer": "occupation_du_sol_2_01" } as Partial<LayerSpecification>);
        source.addExtraDepartmentSourcesOnInit();
        expect(map.sourceIds()).toContain("ocsge-source-dept-39");

        // Le millésime 1 n'existe que dans l'Ain : plus de source supplémentaire.
        await source.setMillesime(1, "01");

        expect(map.sourceIds()).toEqual(["ocsge-source"]);
        expect(map.sources.get("ocsge-source")).toEqual(pmtiles("occupation_du_sol_1_01"));
        expect(map.layerIds()).toEqual(["ocsge-source-layer"]);
        expect(map.sourceLayerOf("ocsge-source-layer")).toBe("occupation_du_sol_1_01");
    });

    it("changer de département principal inverse source principale et source supplémentaire", async () => {
        const source = new OcsgeDiffSource(twoDepartementsLand);
        const map = mount(source, "ocsge-diff-source", { "source-layer": "occupation_du_sol_diff_1_2_01" } as Partial<LayerSpecification>);
        source.addExtraDepartmentSourcesOnInit();

        await source.setMillesimes(1, 2, "39");

        expect(map.sources.get("ocsge-diff-source")).toEqual(pmtiles("occupation_du_sol_diff_1_2_39"));
        expect(map.sources.get("ocsge-diff-source-dept-01")).toEqual(pmtiles("occupation_du_sol_diff_1_2_01"));
        expect(map.sourceIds()).toEqual(["ocsge-diff-source", "ocsge-diff-source-dept-01"]);
        expect(map.sourceLayerOf("ocsge-diff-source-layer")).toBe("occupation_du_sol_diff_1_2_39");
        expect(map.sourceLayerOf("ocsge-diff-source-layer-dept-01")).toBe("occupation_du_sol_diff_1_2_01");
    });

    it("les centroïdes rechargent leur GeoJSON et leurs clones", async () => {
        const source = new OcsgeArtifDiffCentroidSource(twoDepartementsLand);
        const map = mount(source, "ocsge-artif-diff-centroid-source");
        source.addExtraDepartmentSourcesOnInit();

        await source.setMillesimes(1, 2, "39");

        expect(map.sources.get("ocsge-artif-diff-centroid-source")).toMatchObject({
            data: "https://geo/artif_diff_centroid_1_2_39.geojson.gz",
        });
        expect(map.sources.get("ocsge-artif-diff-centroid-source-dept-01")).toMatchObject({
            data: "https://geo/artif_diff_centroid_1_2_01.geojson.gz",
        });
        expect(map.layerIds()).toEqual([
            "ocsge-artif-diff-centroid-source-layer",
            "ocsge-artif-diff-centroid-source-layer-dept-01",
        ]);
    });
});
