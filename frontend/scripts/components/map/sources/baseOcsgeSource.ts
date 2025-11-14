import { BaseSource } from "./baseSource";
import type { Millesime, LandDetailResultType } from "@services/types/land";

export abstract class BaseOcsgeSource extends BaseSource {
    protected readonly landData: LandDetailResultType;
    protected readonly millesimes: Millesime[];
    protected readonly departements: string[];

    constructor(options: { id: string; type: "vector" | "geojson" }, landData: LandDetailResultType) {
        super(options);

        if (!landData.millesimes?.length) {
            throw new Error("Aucun millésime OCSGE disponible pour ce territoire");
        }
        if (!landData.departements?.length) {
            throw new Error("Aucun département disponible pour ce territoire");
        }

        this.landData = landData;
        this.millesimes = landData.millesimes;
        this.departements = landData.departements;
    }

    getId(): string {
        return this.options.id;
    }
}

