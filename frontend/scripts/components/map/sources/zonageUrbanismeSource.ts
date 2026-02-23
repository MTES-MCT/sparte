import { BaseOcsgeSource } from "./baseOcsgeSource";
import { OCSGE_TILES_URL } from "../constants/config";
import type { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, FilterSpecification, LayerSpecification } from "maplibre-gl";
import { getLastMillesimeIndex, getTerritoryFilter } from "../utils/ocsge";

export class ZonageUrbanismeSource extends BaseOcsgeSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;
	private extraSourceIds: string[] = [];

	constructor(landData: LandDetailResultType) {
		super({
			id: "zonage-urbanisme-source",
			type: "vector",
		}, landData);

		this.millesimeIndex = getLastMillesimeIndex(this.millesimes);

		const millesime = this.millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || this.departements[0];
	}

	getOptions(): SourceSpecification {
		const tilesUrl = `${OCSGE_TILES_URL}zonage_urbanisme_${this.millesimeIndex}_${this.departement}.pmtiles`;

		return {
			type: this.options.type as 'vector',
			url: `pmtiles://${tilesUrl}`,
		} as SourceSpecification;
	}

	async setMillesime(newIndex: number, newDepartement: string): Promise<void> {
		if (!this.map || !this.sourceId) {
			console.warn('ZonageUrbanismeSource: map ou sourceId non attaché');
			return;
		}

		if (this.millesimeIndex === newIndex && this.departement === newDepartement) return;

		this.millesimeIndex = newIndex;
		this.departement = newDepartement;

		await this.reloadSource();
	}

	async addExtraDepartmentSourcesOnInit(): Promise<void> {
		await this.addExtraDepartmentSources();
	}

	protected async reloadSource(): Promise<void> {
		if (!this.map || !this.sourceId) return;

		this.removeExtraSources();
		await super.reloadSource();
		await this.addExtraDepartmentSources();
	}

	private removeExtraSources(): void {
		if (!this.map) return;

		for (const extraSourceId of this.extraSourceIds) {
			const style = this.map.getStyle();
			if (style) {
				const layersToRemove = style.layers.filter((l: LayerSpecification) =>
					'source' in l && (l as { source?: string }).source === extraSourceId
				);
				for (const layer of layersToRemove) {
					if (this.map.getLayer(layer.id)) {
						this.map.removeLayer(layer.id);
					}
				}
			}
			if (this.map.getSource(extraSourceId)) {
				this.map.removeSource(extraSourceId);
			}
		}
		this.extraSourceIds = [];
	}

	private async addExtraDepartmentSources(): Promise<void> {
		if (!this.map || !this.sourceId) return;

		const deptsForIndex = this.millesimes
			.filter(m => m.index === this.millesimeIndex)
			.map(m => m.departement)
			.filter(d => d !== this.departement);

		if (deptsForIndex.length === 0) return;

		const style = this.map.getStyle();
		const primaryLayers = style.layers.filter((l: LayerSpecification) =>
			'source' in l && (l as { source?: string }).source === this.sourceId
		);

		for (const dept of deptsForIndex) {
			const extraSourceId = `${this.sourceId}-dept-${dept}`;
			const tilesUrl = `${OCSGE_TILES_URL}zonage_urbanisme_${this.millesimeIndex}_${dept}.pmtiles`;

			this.map.addSource(extraSourceId, {
				type: 'vector',
				url: `pmtiles://${tilesUrl}`,
			} as SourceSpecification);

			this.extraSourceIds.push(extraSourceId);

			for (const primaryLayer of primaryLayers) {
				const sourceLayer = 'source-layer' in primaryLayer
					? (primaryLayer as { 'source-layer'?: string })['source-layer']
					: undefined;

				let updatedSourceLayer = sourceLayer;
				if (sourceLayer && sourceLayer.startsWith('zonage_urbanisme_')) {
					updatedSourceLayer = `zonage_urbanisme_${this.millesimeIndex}_${dept}`;
				}

				const clonedSpec: LayerSpecification = {
					...primaryLayer,
					id: `${primaryLayer.id}-dept-${dept}`,
					source: extraSourceId,
					...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
				} as LayerSpecification;

				this.map.addLayer(clonedSpec);
			}
		}
	}

	protected updateSourceLayer(sourceLayer: string): string {
		if (sourceLayer.startsWith('zonage_urbanisme_')) {
			return `zonage_urbanisme_${this.millesimeIndex}_${this.departement}`;
		}
		return sourceLayer;
	}

	getAvailableMillesimes(): Array<{ value: string; label: string }> {
		return this.millesimes.map(m => ({
			value: `${m.index}_${m.departement}`,
			label: m.year ? `${m.year} - ${m.departement_name || m.departement}` : `Index ${m.index} - ${m.departement_name || m.departement}`
		}));
	}

	getAvailableMillesimesByIndex(): Array<{ value: string; label: string }> {
		const byIndex = new Map<number, { years: Set<string>; departement: string }>();
		for (const m of this.millesimes) {
			if (!byIndex.has(m.index)) {
				byIndex.set(m.index, { years: new Set(), departement: m.departement });
			}
			if (m.year) byIndex.get(m.index)!.years.add(String(m.year));
		}
		return Array.from(byIndex.entries())
			.sort(([a], [b]) => a - b)
			.map(([index, { years, departement }]) => ({
				value: `${index}_${departement}`,
				label: years.size > 0
					? Array.from(years).sort().join(', ')
					: `Millésime ${index}`,
			}));
	}

	getTerritoryFilter(): FilterSpecification | null {
		return getTerritoryFilter(this.landData);
	}
}
