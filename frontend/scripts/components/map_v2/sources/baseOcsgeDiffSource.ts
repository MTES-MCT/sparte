import { BaseOcsgeSource } from "./baseOcsgeSource";
import type { LandDetailResultType, Millesime } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getAvailableMillesimePairs } from "../utils/ocsge";
import type { SourceInterface } from "../types/sourceInterface";

export abstract class BaseOcsgeDiffSource extends BaseOcsgeSource implements SourceInterface {
    protected startMillesimeIndex: number;
    protected endMillesimeIndex: number;
    protected departement: string;

    constructor(options: { id: string; type: "vector" | "geojson" }, landData: LandDetailResultType) {
        super(options, landData);

        this.endMillesimeIndex = getLastMillesimeIndex(this.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(this.millesimes);

        if (this.endMillesimeIndex - this.startMillesimeIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour une source de différence OCSGE");
        }

        const millesime = this.millesimes.find((m: Millesime) => m.index === this.endMillesimeIndex);
        this.departement = millesime?.departement || this.departements[0];
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number, newDepartement?: string): Promise<void> {
        if (!this.map || !this.sourceId) {
            console.warn(`${this.getId()}: map ou sourceId non attaché`);
            return;
        }

        if (newEndIndex - newStartIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour une source de différence OCSGE");
        }

        const targetDepartement = newDepartement || this.departement;

        if (this.startMillesimeIndex === newStartIndex &&
            this.endMillesimeIndex === newEndIndex &&
            this.departement === targetDepartement) {
            return;
        }

        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;
        this.departement = targetDepartement;

        await this.reloadSource();
    }

    getAvailableMillesimePairs(): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }> {
        return getAvailableMillesimePairs(this.landData);
    }
}

