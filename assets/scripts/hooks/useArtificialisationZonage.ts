import { useGetArtifZonageIndexQuery } from '@services/api';
import { LandDetailResultType } from "@services/types/land";


interface UseArtificialisationZonageProps {
    landData: LandDetailResultType;
    defaultStockIndex: number;
}

interface UseArtificialisationZonageReturn {
    artifZonageIndex: any;
    isLoading: boolean;
    error: any;
}

export const useArtificialisationZonage = ({
    landData,
    defaultStockIndex
}: UseArtificialisationZonageProps): UseArtificialisationZonageReturn => {
    const { data: artifZonageIndex, isLoading, error } = useGetArtifZonageIndexQuery({
        land_type: landData.land_type,
        land_id: landData.land_id,
        millesime_index: defaultStockIndex,
    });

    return {
        artifZonageIndex,
        isLoading,
        error
    };
}; 