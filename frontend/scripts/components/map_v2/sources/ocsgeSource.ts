import { BaseSource } from "./baseSource";
import { OCSGE_TILES_URL } from "../constants/config";
import { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, LayerSpecification } from "maplibre-gl";
import { getLastMillesimeIndex } from "../utils/ocsge";

export class OcsgeSource extends BaseSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;
	private readonly millesimes: Millesime[];
	private readonly departements: string[];

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

}
