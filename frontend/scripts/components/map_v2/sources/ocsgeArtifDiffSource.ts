import { BaseSource } from "./baseSource";
import { OCSGE_TILES_URL } from "../constants/config";
import { Millesime, LandDetailResultType } from "@services/types/land";
import type { SourceInterface } from "../types/sourceInterface";
import type { SourceSpecification, FilterSpecification } from "maplibre-gl";
import { getLastMillesimeIndex, getStartMillesimeIndex, getTerritoryFilter, getAvailableMillesimePairs } from "../utils/ocsge";

export class OcsgeArtifDiffSource extends BaseSource implements SourceInterface {
    private startMillesimeIndex: number;
    private endMillesimeIndex: number;
    private departement: string;
    private readonly millesimes: Millesime[];
    private readonly departements: string[];
    private readonly landData: LandDetailResultType;

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-artif-diff-source",
            type: "vector",
        });

        this.landData = landData;
        this.millesimes = landData.millesimes || [];
        this.departements = landData.departements || [];

        this.endMillesimeIndex = getLastMillesimeIndex(this.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(this.millesimes);

        if (this.endMillesimeIndex - this.startMillesimeIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour la source de différence d'artificialisation");
        }

        const millesime = this.millesimes.find((m: Millesime) => m.index === this.endMillesimeIndex);
        this.departement = millesime?.departement || this.departements[0];
    }

    getOptions(): SourceSpecification {
        const tilesUrl = `${OCSGE_TILES_URL}artif_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.pmtiles`;

        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${tilesUrl}`,
        } as SourceSpecification;
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number, newDepartement?: string): Promise<void> {
        if (!this.map || !this.sourceId) {
            console.warn('OcsgeArtifDiffSource: map ou sourceId non attaché');
            return;
        }

        // Vérifier que les millésimes sont consécutifs
        if (newEndIndex - newStartIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour la source de différence d'artificialisation");
        }

        const targetDepartement = newDepartement || this.departement;

        if (this.startMillesimeIndex === newStartIndex &&
            this.endMillesimeIndex === newEndIndex &&
            this.departement === targetDepartement) {
            return;
        }

        // Mettre à jour les index et le département
        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;
        this.departement = targetDepartement;

        await this.reloadSource();
    }

    async setMillesime(newIndex: number, newDepartement: string): Promise<void> {
        // Pour une source de diff, on utilise le millésime comme startIndex
        // et on cherche le millésime suivant
        const nextIndex = newIndex + 1;
        const nextMillesime = this.millesimes.find((m: Millesime) => m.index === nextIndex);

        if (!nextMillesime) {
            throw new Error(`Aucun millésime suivant trouvé pour l'index ${newIndex}`);
        }

        await this.setMillesimes(newIndex, nextIndex);
    }

    protected updateSourceLayer(sourceLayer: string): string {
        // Toujours retourner le nom du layer avec les millésimes actuels
        return `artif_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

    getAvailableMillesimePairs(): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }> {
        return getAvailableMillesimePairs(this.landData);
    }

    getStartMillesimeIndex(): number {
        return this.startMillesimeIndex;
    }

    getEndMillesimeIndex(): number {
        return this.endMillesimeIndex;
    }

    getDepartement(): string {
        return this.departement;
    }

    getId(): string {
        return this.options.id;
    }

    getTerritoryFilter(): FilterSpecification | null {
        return getTerritoryFilter(this.landData);
    }
}

