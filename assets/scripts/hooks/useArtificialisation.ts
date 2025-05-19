import { useState } from 'react';
import { useGetLandArtifStockIndexQuery } from '@services/api';
import { LandDetailResultType } from '@services/types/land';
import { LandArtifStockIndex, defautLandArtifStockIndex } from '@services/types/landartifstockindex';
import { useMemo } from 'react';
import { useMillesime } from './useMillesime';

interface UseArtificialisationProps {
    landData: LandDetailResultType;
}

interface UseArtificialisationReturn {
    // States
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
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
    landData
}: UseArtificialisationProps): UseArtificialisationReturn => {
    // Utilisation du hook useMillesime pour gérer les millésimes
    const { selectedIndex, setSelectedIndex, defaultStockIndex } = useMillesime({
        millesimes_by_index: landData?.millesimes_by_index || []
    });

    // Permet d'afficher des données supplémentaires si le territoire est interdépartemental
    const [byDepartement, setByDepartement] = useState(false);

    // Permet d'afficher des données supplémentaires si le territoire a des territoires enfants (pour les EPCI, Département, Région, etc.)
    const [childLandType, setChildLandType] = useState(
        landData?.child_land_types ? landData.child_land_types[0] : undefined
    );

    // Récupération de toutes les données d'artificialisation disponibles pour le territoire
    const { data: landArtifStockIndexes, isLoading, error } = useGetLandArtifStockIndexQuery({
        land_type: landData?.land_type,
        land_id: landData?.land_id,
        millesime_index: defaultStockIndex,
    }, {
        skip: !landData
    });

    // Sélection des données d'artificialisation correspondant au millésime par défaut
    const landArtifStockIndex: LandArtifStockIndex = useMemo(() =>
        landArtifStockIndexes?.find(
            (e: LandArtifStockIndex) => e.millesime_index === defaultStockIndex
        ) ?? defautLandArtifStockIndex,
        [landArtifStockIndexes, defaultStockIndex]
    );

    return {
        // States
        selectedIndex,
        setSelectedIndex,
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