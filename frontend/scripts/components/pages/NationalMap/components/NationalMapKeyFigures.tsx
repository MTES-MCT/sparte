import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import Kpi from '@components/ui/Kpi';
import type { KeyFiguresModel } from '../domain/frame/types';

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

interface NationalMapKeyFiguresProps {
    model: KeyFiguresModel;
}

// Chiffres clés de la zone affichée, avec les cartes Kpi des diagnostics
const NationalMapKeyFigures: React.FC<NationalMapKeyFiguresProps> = ({ model }) => {
    if (model.kind === 'empty') return <Empty>{model.message}</Empty>;

    return (
        <Grid aria-label="Chiffres clés">
            {model.figures.map(({ icon, label, value, unit, footer }) => (
                <Kpi
                    key={label}
                    compact
                    icon={icon}
                    label={label}
                    value={value === null ? '–' : <>{value} <span>{unit}</span></>}
                    variant="default"
                    footer={footer}
                />
            ))}
        </Grid>
    );
};

export default NationalMapKeyFigures;
