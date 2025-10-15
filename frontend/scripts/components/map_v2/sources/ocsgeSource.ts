import { BaseSource } from "./baseSource";
import { OCSGE_TILES_URL } from "../constants/config";
import { Millesime } from "@services/types/land";

const getLastMillesimeIndex = (millesimes: Millesime[]): number => {
	if (!millesimes || millesimes.length === 0) {
		return 1;
	}

	return Math.max(...millesimes.map(m => m.index));
};

export class OcsgeSource extends BaseSource {
	private millesimeIndex: number;
	private departement: string;
	private millesimes: Millesime[];
	private departements: string[];

	constructor(millesimes: Millesime[], departements: string[], millesimeIndex?: number) {
		super({
			id: "ocsge-source",
			type: "vector",
		});

		this.millesimes = millesimes;
		this.departements = departements;
		this.millesimeIndex = millesimeIndex ?? getLastMillesimeIndex(millesimes);

		const millesime = millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || departements[0];
	}

	getOptions() {
		const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_${this.millesimeIndex}_${this.departement}.pmtiles`;

		return {
			type: this.options.type,
			url: `pmtiles://${tilesUrl}`,
		};
	}

	async setMillesime(newIndex: number): Promise<void> {
		if (!this.map || !this.sourceId) {
			console.warn('OcsgeSource: map ou sourceId non attaché');
			return;
		}

		if (this.millesimeIndex === newIndex) return;

		// Mettre à jour l'index et le département
		this.millesimeIndex = newIndex;
		const millesime = this.millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || this.departements[0];

		// Trouver toutes les layers qui utilisent cette source et sauvegarder leurs specs
		const style = this.map.getStyle();
		const layerSpecs = style.layers
			.filter((l: any) => l.source === this.sourceId)
			.map((l: any) => {
				// Créer une copie propre du spec de la layer (sans les propriétés internes)
				const { id, type, source, 'source-layer': sourceLayer, minzoom, maxzoom, filter, layout, paint } = l;

				// Mettre à jour le source-layer avec le nouveau millésime si c'est un layer OCSGE
				let updatedSourceLayer = sourceLayer;
				if (sourceLayer && sourceLayer.startsWith('occupation_du_sol_')) {
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
				};
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
		this.map.addSource(this.sourceId, newOptions as any);

		// 4. Recréer les layers avec leurs specs propres
		layerSpecs.forEach((layerSpec) => {
			this.map!.addLayer(layerSpec as any);
		});
	}

	getMillesimeIndex(): number {
		return this.millesimeIndex;
	}

	getDepartement(): string {
		return this.departement;
	}
}
