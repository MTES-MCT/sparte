export type LandArtifStockIndex = {
    land_id: string;
    land_type: string;
    departements: string[];
    years: number[];
    surface: number;
    percent: number;
    millesime_index: number;
    flux_surface: number;
    flux_percent: number;
    flux_previous_years: number[];
}

export const defautLandArtifStockIndex: LandArtifStockIndex = {
    land_id: "",
    land_type: "",
    departements: [],
    years: [],
    surface: 0,
    percent: 0,
    millesime_index: 0,
    flux_surface: 0,
    flux_percent: 0,
    flux_previous_years: [],
}