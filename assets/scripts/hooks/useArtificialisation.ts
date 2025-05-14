import { useState } from 'react';
import { useGetLandArtifStockIndexQuery } from '@services/api';
import { ProjectDetailResultType } from '@services/types/project';
import { LandDetailResultType } from '@services/types/land';
import { LandArtifStockIndex, defautLandArtifStockIndex } from '@services/types/landartifstockindex';
import { useMemo } from 'react';

interface UseArtificialisationProps {
    projectData: ProjectDetailResultType;
    landData: LandDetailResultType;
}

interface UseArtificialisationReturn {
    // States
    stockIndex: number;
    setStockIndex: (index: number) => void;
    defaultStockIndex: number;
    byDepartement: boolean;
    setByDepartement: (value: boolean) => void;
    childLandType: string | undefined;
    setChildLandType: (value: string | undefined) => void;
    isLoading: boolean;
    error: any;

    // Datas
    landArtifStockIndex: LandArtifStockIndex;
}

export const useArtificialisation = ({
    projectData,
    landData
}: UseArtificialisationProps): UseArtificialisationReturn => {
    // Millésime par défaut
    const defaultStockIndex = useMemo(() => 
        landData?.millesimes_by_index?.length > 0
            ? Math.max(...landData.millesimes_by_index.map((e) => e.index))
            : 2,
        [landData?.millesimes_by_index]
    );

    // Millésime sélectionné
    const [stockIndex, setStockIndex] = useState(defaultStockIndex);

    // Permet d'afficher des données supplémentaires si le territoire est interdépartemental
    const [byDepartement, setByDepartement] = useState(false);

    // Permet d'afficher des données supplémentaires si le territoire a des territoires enfants (EPCI, Département, Région, etc.)
    const [childLandType, setChildLandType] = useState(
        landData?.child_land_types ? landData.child_land_types[0] : undefined
    );

    // Récupération des données d'artificialisation
    const { data: landArtifStockIndexes, isLoading, error } = useGetLandArtifStockIndexQuery({
        land_type: projectData?.land_type,
        land_id: projectData?.land_id,
        millesime_index: defaultStockIndex,
    }, {
        skip: !projectData
    });

    // Récupère les données d'artificialisation du millésime sélectionné
    const landArtifStockIndex: LandArtifStockIndex = useMemo(() =>
        landArtifStockIndexes?.find(
            (e: LandArtifStockIndex) => e.millesime_index === stockIndex
        ) ?? defautLandArtifStockIndex,
        [landArtifStockIndexes, stockIndex]
    );

    return {
        // States
        stockIndex,
        setStockIndex,
        defaultStockIndex,
        byDepartement,
        setByDepartement,
        childLandType,
        setChildLandType,
        isLoading,
        error,

        // Datas
        landArtifStockIndex,
        
    };
}; 