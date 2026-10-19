import { BaseMultiDepartementSource } from "./baseMultiDepartementSource";
import type { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, FilterSpecification } from "maplibre-gl";
import { getLastMillesimeIndex, getTerritoryFilter } from "../utils/ocsge";

export class ZonageUrbanismeSource extends BaseMultiDepartementSource implements SourceInterface {
	private millesimeIndex: number;
	private departement: string;

	constructor(landData: LandDetailResultType) {
		super({
			id: "zonage-urbanisme-source",
			type: "vector",
		}, landData);

		this.millesimeIndex = getLastMillesimeIndex(this.millesimes);

		const millesime = this.millesimes.find((m: Millesime) => m.index === this.millesimeIndex);
		this.departement = millesime?.departement || this.departements[0];
	}

	private tileName(departement: string): string {
		return `zonage_urbanisme_${this.millesimeIndex}_${departement}`;
	}

	protected getCurrentDepartement(): string {
		return this.departement;
	}

	protected getCurrentMillesimeIndex(): number {
		return this.millesimeIndex;
	}

	protected buildOptions(departement: string): SourceSpecification {
		return this.pmtilesOptions(this.tileName(departement));
	}

	protected sourceLayerForDepartement(sourceLayer: string, departement: string): string {
		return sourceLayer.startsWith("zonage_urbanisme_") ? this.tileName(departement) : sourceLayer;
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
