import { useGetImperZonageIndexQuery } from '@services/api';
import { LandDetailResultType } from "@services/types/land";


interface UseImpermeabilisationZonageProps {
    landData: LandDetailResultType;
    defaultStockIndex: number;
}

interface UseImpermeabilisationZonageReturn {
    imperZonageIndex: any;
    isLoading: boolean;
    error: any;
}

export const useImpermeabilisationZonage = ({
    landData,
    defaultStockIndex
}: UseImpermeabilisationZonageProps): UseImpermeabilisationZonageReturn => {
    const { data: imperZonageIndex, isLoading, error } = useGetImperZonageIndexQuery({
        land_type: landData.land_type,
        land_id: landData.land_id,
        millesime_index: defaultStockIndex,
    });

    return {
        imperZonageIndex,
        isLoading,
        error
    };
};
