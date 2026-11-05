import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import GenericChart from '@components/charts/GenericChart';
import { ZONE_HEXAGONE, zoneToLand } from './zones';

// Mêmes graphiques serveur que la page Consommation des diagnostics
const CHARTS: Record<string, string> = {
    conso_by_year_and_destination: 'chart_determinant',
    destination_share: 'pie_determinant',
};

// Empilés sous la légende, dans la colonne à droite de la carte
const Band = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const Note = styled.p`
    margin: 0;
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.textMuted};
`;

interface ConsoChartsProps {
    zone: string;
    startYear: number;
    endYear: number;
    // Identifiants des graphiques à afficher, dans l'ordre
    charts: string[];
}

// Graphiques complémentaires de la carte, pour la zone affichée. L'Hexagone n'est pas un
// territoire en base : on affiche la France entière en le signalant.
const ConsoCharts: React.FC<ConsoChartsProps> = ({ zone, startYear, endYear, charts }) => {
    const ids = charts.filter((id) => CHARTS[id]);
    if (ids.length === 0) return null;

    const land = zoneToLand(zone) ?? { land_type: 'NATION', land_id: 'NATION' };
    const params = { start_date: String(startYear), end_date: String(endYear) };

    return (
        <Band aria-label="Graphiques complémentaires">
            {zone === ZONE_HEXAGONE && (
                <Note>Les graphiques de l'Hexagone seul ne sont pas disponibles : ceux de la France entière sont affichés.</Note>
            )}
            {ids.map((id) => (
                <GenericChart
                    key={`${id}-${land.land_type}-${land.land_id}`}
                    id={CHARTS[id]}
                    land_id={land.land_id}
                    land_type={land.land_type}
                    params={params}
                    sources={['majic']}
                    showDataTable
                />
            ))}
        </Band>
    );
};

export default ConsoCharts;
