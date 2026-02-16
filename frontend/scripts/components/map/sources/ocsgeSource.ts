import { BaseOcsgeSource } from "./baseOcsgeSource";
import { OCSGE_TILES_URL } from "../constants/config";
import type { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, FilterSpecification, LayerSpecification, StyleSpecification } from "maplibre-gl";
import { getLastMillesimeIndex, getTerritoryFilter } from "../utils/ocsge";

export class OcsgeSource extends BaseOcsgeSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;
	private extraSourceIds: string[] = [];

	constructor(landData: LandDetailResultType) {
		super({
			id: "ocsge-source",
			type: "vector",
		}, landData);

		this.millesimeIndex = getLastMillesimeIndex(this.millesimes);

		const millesime = this.millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || this.departements[0];
	}

	getOptions(): SourceSpecification {
		const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_${this.millesimeIndex}_${this.departement}.pmtiles`;

		return {
			type: this.options.type as 'vector',
			url: `pmtiles://${tilesUrl}`,
		} as SourceSpecification;
	}

	async setMillesime(newIndex: number, newDepartement: string): Promise<void> {
		if (!this.map || !this.sourceId) {
			console.warn('OcsgeSource: map ou sourceId non attaché');
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

		// Supprimer les sources/layers secondaires existantes
		this.removeExtraSources();

		// Reload la source principale (premier département)
		await super.reloadSource();

		// Ajouter les sources/layers secondaires pour les autres départements
		await this.addExtraDepartmentSources();
	}

	private removeExtraSources(): void {
		if (!this.map) return;

		for (const extraSourceId of this.extraSourceIds) {
			// Supprimer les layers de cette source
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
			// Supprimer la source
			if (this.map.getSource(extraSourceId)) {
				this.map.removeSource(extraSourceId);
			}
		}
		this.extraSourceIds = [];
	}

	private async addExtraDepartmentSources(): Promise<void> {
		if (!this.map || !this.sourceId) return;

		// Trouver tous les départements pour cet index
		const deptsForIndex = this.millesimes
			.filter(m => m.index === this.millesimeIndex)
			.map(m => m.departement)
			.filter(d => d !== this.departement);

		if (deptsForIndex.length === 0) return;

		// Collecter les specs des layers de la source principale pour les cloner
		const style = this.map.getStyle();
		const primaryLayers = style.layers.filter((l: LayerSpecification) =>
			'source' in l && (l as { source?: string }).source === this.sourceId
		);

		for (const dept of deptsForIndex) {
			const extraSourceId = `${this.sourceId}-dept-${dept}`;
			const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_${this.millesimeIndex}_${dept}.pmtiles`;

			// Ajouter la source pour ce département
			this.map.addSource(extraSourceId, {
				type: 'vector',
				url: `pmtiles://${tilesUrl}`,
			} as SourceSpecification);

			this.extraSourceIds.push(extraSourceId);

			// Cloner chaque layer de la source principale pour cette source
			for (const primaryLayer of primaryLayers) {
				const sourceLayer = 'source-layer' in primaryLayer
					? (primaryLayer as { 'source-layer'?: string })['source-layer']
					: undefined;

				// Mettre à jour le source-layer pour ce département
				let updatedSourceLayer = sourceLayer;
				if (sourceLayer && sourceLayer.startsWith('occupation_du_sol_')) {
					updatedSourceLayer = `occupation_du_sol_${this.millesimeIndex}_${dept}`;
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
		if (sourceLayer.startsWith('occupation_du_sol_')) {
			return `occupation_du_sol_${this.millesimeIndex}_${this.departement}`;
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
