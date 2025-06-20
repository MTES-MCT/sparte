export interface LandFriche {
    site_id: string;
    site_nom: string;
    land_id: string;
    land_type: string;
    land_name: string;
    friche_sol_pollution: string;
    friche_statut: string;
    friche_is_in_zone_activite: boolean;
    friche_zonage_environnemental: string;
    friche_type_zone: string;
    friche_type: string;
    friche_surface_percentile_rank: number;
    surface: number;
    point_on_surface: {
        type: "Point";
        coordinates: [number, number];
    };
}

export type UseLandFrichesType = (arg: { land_type: string; land_id: string }) => {
    data?: LandFriche[];
    isLoading: boolean;
    error?: any;
    refetch: () => void;
}; 