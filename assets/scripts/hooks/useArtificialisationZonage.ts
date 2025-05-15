import { useGetArtifZonageIndexQuery } from '@services/api';
import { ProjectDetailResultType } from '@services/types/project';

interface UseArtificialisationZonageProps {
    projectData: ProjectDetailResultType;
    defaultStockIndex: number;
}

interface UseArtificialisationZonageReturn {
    artifZonageIndex: any;
    isLoading: boolean;
    error: any;
}

export const useArtificialisationZonage = ({
    projectData,
    defaultStockIndex
}: UseArtificialisationZonageProps): UseArtificialisationZonageReturn => {
    const { data: artifZonageIndex, isLoading, error } = useGetArtifZonageIndexQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id,
        millesime_index: defaultStockIndex,
    });

    return {
        artifZonageIndex,
        isLoading,
        error
    };
}; 