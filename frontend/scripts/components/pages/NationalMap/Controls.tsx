import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import PeriodSelector from '@components/ui/PeriodSelector';
import { REGIONS, SCALE_LABELS, ZONE_FRANCE, ZONE_HEXAGONE, zoneToLand } from './zones';
import { STACK_BREAKPOINT } from './layoutStyles';

// Sélecteurs de zone, de maille et de période, dans le style des contrôles de la page
// Consommation des diagnostics : en ligne dans la barre de titre sur grand écran,
// empilés en haut du panneau d'informations sur mobile.

const CHEVRON =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23161616' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")";

const Bar = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
`;

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const Group = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
`;

// Dans la barre, les libellés disparaissent sur les écrans moyens, comme dans les diagnostics
const Label = styled.span<{ $inBar: boolean }>`
    font-size: 0.8rem;
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.text};
    flex-shrink: 0;

    i {
        margin-right: 0.3rem;
    }

    ${({ $inBar }) =>
        $inBar &&
        `
        @media (max-width: 1280px) {
            display: none;
        }
    `}
`;

const Separator = styled.span`
    padding: 0.1rem;
    color: var(--artwork-motif-blue-france);

    @media (max-width: ${STACK_BREAKPOINT}) {
        display: none;
    }
`;

// Même habillage que les boutons d'année du sélecteur de période
const ZoneSelect = styled.select`
    appearance: none;
    max-width: 15rem;
    padding: 0.375rem 1.75rem 0.375rem 0.75rem;
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.text};
    text-overflow: ellipsis;
    background: transparent ${CHEVRON} no-repeat right 0.65rem center;
    border: 1px solid ${theme.button.secondary.border};
    border-radius: ${theme.radius.default};
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
        background-color: ${theme.button.secondary.backgroundHover};
        border-color: ${theme.button.secondary.borderHover};
    }
`;

interface ControlsProps {
    layout: 'bar' | 'stack';
    zone: string;
    scale: string;
    scales: string[];
    startYear: number;
    endYear: number;
    minYear: number;
    maxYear: number;
    // Nom du territoire affiché quand ce n'est pas une région (département, EPCI)
    currentName?: string;
    onZoneChange: (zone: string) => void;
    onScaleChange: (scale: string) => void;
    onStartYearChange: (year: number) => void;
    onEndYearChange: (year: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
    layout,
    zone,
    scale,
    scales,
    startYear,
    endYear,
    minYear,
    maxYear,
    currentName,
    onZoneChange,
    onScaleChange,
    onStartYearChange,
    onEndYearChange,
}) => {
    const inBar = layout === 'bar';
    const Container = inBar ? Bar : Stack;
    const Item = inBar ? Group : Field;
    const land = zoneToLand(zone);

    return (
        <Container role="group" aria-label="Zone, maille et période">
            <Item>
                <Label $inBar={inBar}>Zone</Label>
                <ZoneSelect value={zone} onChange={(e) => onZoneChange(e.target.value)} aria-label="Zone affichée">
                    <option value={ZONE_FRANCE}>France entière</option>
                    <option value={ZONE_HEXAGONE}>Hexagone</option>
                    <optgroup label="Régions">
                        {REGIONS.map(({ code, label }) => (
                            <option key={code} value={`REGION_${code}`}>
                                {label}
                            </option>
                        ))}
                    </optgroup>
                    {land && land.land_type !== 'REGION' && (
                        <optgroup label="Territoire affiché">
                            <option value={zone}>{currentName ?? land.land_id}</option>
                        </optgroup>
                    )}
                </ZoneSelect>
            </Item>
            {inBar && <Separator aria-hidden="true">|</Separator>}
            <Item>
                <Label $inBar={inBar}>
                    <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
                    Maille
                </Label>
                <Group role="group" aria-label="Maille affichée">
                    {scales.map((code) => (
                        <Button
                            key={code}
                            type="button"
                            size="sm"
                            variant={code === scale ? 'primary' : 'secondary'}
                            aria-pressed={code === scale}
                            onClick={() => onScaleChange(code)}
                        >
                            {SCALE_LABELS[code]}
                        </Button>
                    ))}
                </Group>
            </Item>
            {inBar && <Separator aria-hidden="true">|</Separator>}
            <Item>
                <Label $inBar={inBar}>Période</Label>
                <PeriodSelector
                    startYear={startYear}
                    endYear={endYear}
                    minYear={minYear}
                    maxYear={maxYear}
                    onStartYearChange={onStartYearChange}
                    onEndYearChange={onEndYearChange}
                    dropdownAlign={inBar ? 'right' : 'left'}
                />
            </Item>
        </Container>
    );
};

export default Controls;
