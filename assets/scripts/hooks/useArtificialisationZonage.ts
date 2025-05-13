import { useGetArtifZonageIndexQuery } from '@services/api';
import { ProjectDetailResultType } from '@services/types/project';

interface UseArtificialisationZonageProps {
    projectData: ProjectDetailResultType;
    stockIndex: number;
}

interface UseArtificialisationZonageReturn {
    artifZonageIndex: any;
    isLoading: boolean;
    error: any;
}

export const useArtificialisationZonage = ({
    projectData,
    stockIndex
}: UseArtificialisationZonageProps): UseArtificialisationZonageReturn => {
    const { data: artifZonageIndex, isLoading, error } = useGetArtifZonageIndexQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id,
        millesime_index: stockIndex,
    });

    return {
        artifZonageIndex,
        isLoading,
        error
    };
}; 