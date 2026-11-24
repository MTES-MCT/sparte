import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { PARENT_BOUNDARY_STYLE } from '../../domain/parentBoundary';

// Dernière ligne d'une légende, sous ses classes : elle dit ce qu'est le trait en tireté que la
// carte pose sur les territoires qui débordent de la zone (voir domain/parentBoundary.ts)
const Key = styled.p`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    /* Les marges latérales des légendes (voir ClassLegend) */
    padding: 0 0.75rem 0.4rem;
    color: ${theme.colors.text};
    font-size: ${theme.fontSize.xs};
    line-height: 1.2;
`;

const SAMPLE_WIDTH_PX = 28;
const SAMPLE_HEIGHT_PX = 8;

const { color, widthPx, casingColor, casingWidthPx, dash } = PARENT_BOUNDARY_STYLE;
// Le tireté de la carte est donné en épaisseurs de trait
const DASH_PX = dash.map((length) => length * widthPx).join(' ');

// Échantillon du trait, dessiné avec le style de la carte : le même tireté sombre sur son liseré clair
const Sample: React.FC = () => (
    <svg width={SAMPLE_WIDTH_PX} height={SAMPLE_HEIGHT_PX} aria-hidden="true" focusable="false">
        <line x1={0} y1={SAMPLE_HEIGHT_PX / 2} x2={SAMPLE_WIDTH_PX} y2={SAMPLE_HEIGHT_PX / 2} stroke={casingColor} strokeWidth={casingWidthPx} />
        <line x1={0} y1={SAMPLE_HEIGHT_PX / 2} x2={SAMPLE_WIDTH_PX} y2={SAMPLE_HEIGHT_PX / 2} stroke={color} strokeWidth={widthPx} strokeDasharray={DASH_PX} />
    </svg>
);

// `label` : « Limite du département »
const BoundaryKey: React.FC<{ label: string }> = ({ label }) => (
    <Key data-boundary-key>
        <Sample />
        {label}
    </Key>
);

export default BoundaryKey;
