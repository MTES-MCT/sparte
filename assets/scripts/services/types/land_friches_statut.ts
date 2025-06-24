export interface LandFrichesStatut {
    id: number;
    land_id: string;
    land_type: string;
    friche_statut: 'friche reconvertie' | 'friche avec projet' | 'friche sans projet' | 'friche potentielle';
    friche_count: number;
    friche_surface: number;
}

export type UseLandFrichesStatutType = (arg: { land_type: string; land_id: string }) => {
    data?: LandFrichesStatut[];
    isLoading: boolean;
    error?: any;
    refetch: () => void;
};
