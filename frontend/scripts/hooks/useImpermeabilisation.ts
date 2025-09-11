import { useState, useMemo } from 'react';
import { useGetLandImperStockIndexQuery } from '@services/api';
import { LandDetailResultType } from '@services/types/land';
import { LandImperStockIndex, defautLandImperStockIndex } from '@services/types/landimperstockindex';
import { useMillesime } from './useMillesime';

interface UseImpermeabilisationProps {
    landData: LandDetailResultType;
}

interface UseImpermeabilisationReturn {
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
    landImperStockIndex: LandImperStockIndex;
}

export const useImpermeabilisation = ({
    landData
}: UseImpermeabilisationProps): UseImpermeabilisationReturn => {
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

    // Récupération de toutes les données d'imperméabilisation disponibles pour le territoire
    const { data: landImperStockIndexes, isLoading, error } = useGetLandImperStockIndexQuery({
        land_type: landData?.land_type,
        land_id: landData?.land_id,
        millesime_index: defaultStockIndex,
    }, {
        skip: !landData
    });

    // Sélection des données d'imperméabilisation correspondant au millésime par défaut
    const landImperStockIndex: LandImperStockIndex = useMemo(() =>
        landImperStockIndexes?.find(
            (e: LandImperStockIndex) => e.millesime_index === defaultStockIndex
        ) ?? defautLandImperStockIndex,
        [landImperStockIndexes, defaultStockIndex]
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
        landImperStockIndex,
    };
};
