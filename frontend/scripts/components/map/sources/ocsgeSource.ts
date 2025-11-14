import { BaseOcsgeSource } from "./baseOcsgeSource";
import { OCSGE_TILES_URL } from "../constants/config";
import type { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, FilterSpecification } from "maplibre-gl";
import { getLastMillesimeIndex, getTerritoryFilter } from "../utils/ocsge";

export class OcsgeSource extends BaseOcsgeSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;

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

		// Mettre à jour l'index et le département
		this.millesimeIndex = newIndex;
		this.departement = newDepartement;

		await this.reloadSource();
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

	getTerritoryFilter(): FilterSpecification | null {
		return getTerritoryFilter(this.landData);
	}

}
