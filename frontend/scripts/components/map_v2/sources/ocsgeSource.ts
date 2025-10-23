import { BaseSource } from "./baseSource";
import { OCSGE_TILES_URL } from "../constants/config";
import { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, LayerSpecification } from "maplibre-gl";
import { getLastMillesimeIndex } from "../utils/ocsge";

export class OcsgeSource extends BaseSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;
	private millesimes: Millesime[];
	private departements: string[];

	constructor(landData: LandDetailResultType) {
		super({
			id: "ocsge-source",
			type: "vector",
		});

		this.millesimes = landData.millesimes || [];
		this.departements = landData.departements || [];
		this.millesimeIndex = getLastMillesimeIndex(this.millesimes);

		const millesime = this.millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || this.departements[0];
	}

	getId(): string {
		return this.options.id;
	}

	getOptions(): SourceSpecification {
		const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_${this.millesimeIndex}_${this.departement}.pmtiles`;

		return {
			type: this.options.type as 'vector',
			url: `pmtiles://${tilesUrl}`,
		} as SourceSpecification;
	}

	async setMillesime(newIndex: number, newDepartement?: string): Promise<void> {
		if (!this.map || !this.sourceId) {
			console.warn('OcsgeSource: map ou sourceId non attaché');
			return;
		}

		// Si on a un département spécifique, l'utiliser, sinon chercher le premier millésime avec cet index
		let targetDepartement = newDepartement;
		if (!targetDepartement) {
			const millesime = this.millesimes.find((m: Millesime) => m.index === newIndex);
			targetDepartement = millesime?.departement || this.departements[0];
		}

		if (this.millesimeIndex === newIndex && this.departement === targetDepartement) return;

		// Mettre à jour l'index et le département
		this.millesimeIndex = newIndex;
		this.departement = targetDepartement;

		// Trouver toutes les layers qui utilisent cette source et sauvegarder leurs specs
		const style = this.map.getStyle();
		const layerSpecs = style.layers
			.filter((l): l is LayerSpecification => {
				if (!('source' in l)) return false;
				const layerSource = (l as { source?: string }).source;
				return layerSource === this.sourceId;
			})
			.map((l): LayerSpecification => {
				// Créer une copie propre du spec de la layer (sans les propriétés internes)
				const { id, type, minzoom, maxzoom, layout, paint } = l;
				const source = (l as { source?: string }).source;
				const filter = (l as { filter?: unknown }).filter;
				const sourceLayer = 'source-layer' in l ? l['source-layer'] : undefined;

				// Mettre à jour le source-layer avec le nouveau millésime si c'est un layer OCSGE
				let updatedSourceLayer = sourceLayer;
				if (sourceLayer && typeof sourceLayer === 'string' && sourceLayer.startsWith('occupation_du_sol_')) {
					// Remplacer l'ancien index de millésime par le nouveau dans le nom du source-layer
					updatedSourceLayer = `occupation_du_sol_${this.millesimeIndex}_${this.departement}`;
				}

				return {
					id,
					type,
					source,
					...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
					...(minzoom !== undefined && { minzoom }),
					...(maxzoom !== undefined && { maxzoom }),
					...(filter && { filter }),
					...(layout && { layout }),
					...(paint && { paint })
				} as LayerSpecification;
			});

		// 1. Supprimer les layers
		layerSpecs.forEach(({ id }) => {
			if (this.map!.getLayer(id)) {
				this.map!.removeLayer(id);
			}
		});

		// 2. Supprimer la source
		if (this.map.getSource(this.sourceId)) {
			this.map.removeSource(this.sourceId);
		}

		// 3. Recréer la source avec la nouvelle URL
		const newOptions = this.getOptions();
		this.map.addSource(this.sourceId, newOptions);

		// 4. Recréer les layers avec leurs specs propres
		layerSpecs.forEach((layerSpec) => {
			this.map!.addLayer(layerSpec);
		});
	}

	getAvailableMillesimes(): Array<{ value: string; label: string }> {
		return this.millesimes.map(m => ({
			value: `${m.index}_${m.departement}`,
			label: m.year ? `${m.year} - ${m.departement_name || m.departement}` : `Index ${m.index} - ${m.departement_name || m.departement}`
		}));
	}

}
