import { BaseLayer } from "./baseLayer";
import type { StatCategory } from "../types/layer";
import type { LayerSpecification, FilterSpecification } from "maplibre-gl";
import type maplibregl from "maplibre-gl";
import type { LandDetailResultType } from "@services/types/land";
import { getTerritoryFilter } from "../utils/ocsge";
import { area } from "@turf/turf";
import { ZonageType } from "scripts/types/ZonageType";
import { ZONE_TYPE_COLORS } from "@components/ui/ZoneTypeBadge";

export type ZonageUrbanismeMode = "artif" | "imper";

export class ZonageUrbanismeLayer extends BaseLayer {
	private millesimeIndex: number;
	private departement: string;
	private landData?: LandDetailResultType;

	constructor(
		millesimeIndex: number,
		departement: string,
		_mode: ZonageUrbanismeMode,
		landData?: LandDetailResultType,
	) {
		super({
			id: "zonage-urbanisme-layer",
			type: "fill",
			source: "zonage-urbanisme-source",
			visible: true,
			opacity: 0.7,
		});
		this.millesimeIndex = millesimeIndex;
		this.departement = departement;
		this.landData = landData;
	}

	private getSourceLayerName(): string {
		return `zonage_urbanisme_${this.millesimeIndex}_${this.departement}`;
	}

	getOptions(): LayerSpecification[] {
		const territoryFilter = getTerritoryFilter(this.landData);
		const filter: FilterSpecification | undefined = territoryFilter
			? territoryFilter
			: undefined;

		const visibility = this.options.visible ? "visible" : "none";
		const sourceLayer = this.getSourceLayerName();

		return [
			// Colored fill layer
			{
				id: this.options.id,
				type: "fill" as const,
				source: this.options.source,
				"source-layer": sourceLayer,
				...(filter && { filter }),
				layout: { visibility },
				paint: {
					"fill-color": [
						"match",
						["get", "type_zone"],
						"U", "#E63946",
						"AU", "#F4A261",
						"N", "#2A9D8F",
						"A", "#E9C46A",
						"#C8C8C8",
					],
					"fill-opacity": 1,
				},
			} as LayerSpecification,
			// Visible outline
			{
				id: `${this.options.id}-outline`,
				type: "line" as const,
				source: this.options.source,
				"source-layer": sourceLayer,
				...(filter && { filter }),
				layout: { visibility },
				paint: {
					"line-color": "#000000",
					"line-width": 0.2,
					"line-opacity": 0.4,
				},
			} as LayerSpecification,
			// Highlight outline for hovered/locked features
			{
				id: `${this.options.id}-highlight`,
				type: "line" as const,
				source: this.options.source,
				"source-layer": sourceLayer,
				filter: ["==", ["get", "checksum"], ""],
				layout: { visibility },
				paint: {
					"line-color": "#000000",
					"line-width": 3,
					"line-opacity": 1,
				},
			} as LayerSpecification,
		];
	}

	extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
		if (features.length === 0) return [];

		const surfacesByType: Record<string, number> = {};

		for (const feature of features) {
			const props = feature.properties;
			if (!props) continue;

			const typeZone = props.type_zone as string;
			if (!typeZone) continue;

			const featureArea = area(feature.geometry);
			surfacesByType[typeZone] = (surfacesByType[typeZone] || 0) + featureArea;
		}

		const totalSurface = Object.values(surfacesByType).reduce((acc, val) => acc + val, 0);
		if (totalSurface === 0) return [];

		return Object.entries(surfacesByType)
			.map(([typeZone, surface]) => ({
				code: typeZone,
				label: ZonageType[typeZone as keyof typeof ZonageType] || typeZone,
				color: ZONE_TYPE_COLORS[typeZone] || "rgb(200, 200, 200)",
				value: surface,
				percent: (surface / totalSurface) * 100,
			}))
			.filter(cat => cat.percent > 0)
			.sort((a, b) => b.percent - a.percent);
	}
}
