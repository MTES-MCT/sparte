import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import Kpi from '@components/ui/Kpi';
import { formatNumber } from '@utils/formatUtils';
import type { NationalMapLandIndicators } from '@services/api';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.md};

    @media (max-width: 360px) {
        grid-template-columns: 1fr;
    }
`;

const Empty = styled(BaseCard)`
    padding: ${theme.spacing.md};
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.textMuted};
`;

interface KeyFiguresProps {
    // Valeurs des territoires affichés
    lands: NationalMapLandIndicators[];
    startYear: number;
    endYear: number;
}

const sum = (values: (number | null)[]): number | null => {
    const present = values.filter((v): v is number => v !== null && v !== undefined);
    return present.length > 0 ? present.reduce((a, b) => a + b, 0) : null;
};

// Chiffres clés de la zone affichée, avec les cartes Kpi des diagnostics : consommation
// totale et rythme annuel sur la période, sommés sur les territoires visibles
const KeyFigures: React.FC<KeyFiguresProps> = ({ lands, startYear, endYear }) => {
    if (lands.length === 0) return <Empty>Aucune donnée pour cette zone.</Empty>;

    const conso = sum(lands.map((land) => land.conso_ha));
    const years = endYear - startYear + 1;
    const period = { type: 'period' as const, from: String(startYear), to: String(endYear) };

    return (
        <Grid aria-label="Chiffres clés">
            <Kpi
                compact
                icon="bi-bar-chart"
                label="Consommation d'espaces"
                value={conso === null ? '–' : <>{formatNumber({ number: conso, decimals: 0 })} <span>ha</span></>}
                variant="default"
                footer={period}
            />
            <Kpi
                compact
                icon="bi-speedometer2"
                label="Rythme annuel moyen"
                value={conso === null ? '–' : <>{formatNumber({ number: conso / years, decimals: 0 })} <span>ha/an</span></>}
                variant="default"
                footer={period}
            />
        </Grid>
    );
};

export default KeyFigures;
