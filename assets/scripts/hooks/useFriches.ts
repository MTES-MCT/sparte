import { useGetLandFrichesStatutQuery } from '@services/api';
import { LandFrichesStatut } from '@services/types/land_friches_statut';

interface UseFrichesStatutProps {
    land_type: string;
    land_id: string;
}

interface UseFrichesStatutReturn {
    frichesStatut: LandFrichesStatut[] | undefined;
    isLoading: boolean;
    error: any;
}

export const useFrichesStatut = ({
    land_type,
    land_id
}: UseFrichesStatutProps): UseFrichesStatutReturn => {
    const { data: frichesStatut, isLoading, error } = useGetLandFrichesStatutQuery({
        land_type,
        land_id,
    });

    return {
        frichesStatut,
        isLoading,
        error
    };
}; 