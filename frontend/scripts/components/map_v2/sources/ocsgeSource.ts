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

	constructor(millesimes: Millesime[], departements: string[], millesimeIndex?: number) {
		super({
			id: "ocsge-source",
			type: "vector",
		});

		this.millesimeIndex = millesimeIndex ?? getLastMillesimeIndex(millesimes);

		const millesime = millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || departements[0];
	}

	getMillesimeIndex(): number {
		return this.millesimeIndex;
	}

	getDepartement(): string {
		return this.departement;
	}

	getOptions() {
		const tilesUrl = OCSGE_TILES_URL
			.replace("{millesime}", this.millesimeIndex.toString())
			.replace("{departement}", this.departement);

		return {
			...this.options,
			url: `pmtiles://${tilesUrl}`,
		};
	}
}
