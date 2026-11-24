import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import PeriodSelector, { PeriodPreset } from '@components/ui/PeriodSelector';
import { REGIONS, SCALE_LABELS, ZONE_FRANCE, ZONE_HEXAGONE, zoneToLand } from './zones';
import { STACK_BREAKPOINT } from './layoutStyles';

// Sélecteurs de zone, de maille et de période, dans le style des contrôles de la page
// Consommation des diagnostics : en ligne dans la barre de titre sur grand écran,
// empilés en haut du panneau d'informations sur mobile.

// Jusqu'à cette largeur de fenêtre, les libellés des commandes de la barre sont masqués
const BAR_LABELS_BREAKPOINT = '1599px';
// Largeur du sélecteur de période : deux boutons d'année et leur tiret
const BAR_PERIOD_WIDTH = '9rem';
// Fenêtres où la barre, à côté du menu et de la colonne, est la plus étroite : avec les quatre
// boutons de maille d'une zone nationale, le titre « France entière » n'y tient que si le sélecteur
// de zone, qui redit ce titre, lui cède de la place
const TIGHT_BAR = `(min-width: ${Number.parseInt(STACK_BREAKPOINT, 10) + 1}px) and (max-width: 1399px)`;
const TIGHT_BAR_ZONE_WIDTH = '9rem';

const CHEVRON =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23161616' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")";

// Dans la barre de titre, rien ne passe à la ligne : sa hauteur est fixe. Quand la place
// manque, seul le sélecteur de zone, le premier, rétrécit.
const Bar = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;

    > * {
        flex-shrink: 0;
        flex-wrap: nowrap;
    }

    > :first-child {
        flex-shrink: 1;
        min-width: 0;
    }
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

// Dans la barre, les libellés ne s'affichent que sur un grand écran : ailleurs, leur place revient
// au nom du territoire, qui partage la ligne avec les commandes
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
        @media (max-width: ${BAR_LABELS_BREAKPOINT}) {
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

// Largeur du sélecteur de zone quand les millésimes de l'OCS GE remplacent la période : leur
// libellé peut dépasser la place de la période, et c'est au sélecteur, qui redit le titre, de lui
// céder la différence, pas au titre
const ZONE_WIDTH_BESIDE_MILLESIMES = '11rem';

// Même habillage que les boutons d'année du sélecteur de période
const ZoneSelect = styled.select<{ $narrow: boolean }>`
    appearance: none;
    min-width: 0;
    max-width: ${({ $narrow }) => ($narrow ? ZONE_WIDTH_BESIDE_MILLESIMES : '15rem')};
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

    @media ${TIGHT_BAR} {
        max-width: ${TIGHT_BAR_ZONE_WIDTH};
    }
`;

// Place de la période dans la barre : la largeur de son sélecteur. Les millésimes de l'OCS GE,
// qui le remplacent, en occupent au moins autant : tant que leur libellé y tient, les autres
// commandes ne bougent pas d'une rubrique à l'autre ; un libellé plus long (deux millésimes aux
// années différentes) élargit la place plutôt que d'être coupé.
const PeriodSlot = styled.div<{ $inBar: boolean; $grows: boolean }>`
    display: flex;
    ${({ $inBar, $grows }) => $inBar && `${$grows ? 'min-width' : 'width'}: ${BAR_PERIOD_WIDTH};`}
    ${({ $inBar, $grows }) => $inBar && $grows && 'justify-content: flex-end;'}
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
    // Périodes proposées toutes prêtes dans les listes d'années
    presetPeriods: PeriodPreset[];
    // Nom du territoire affiché quand ce n'est pas une région (département, EPCI)
    currentName?: string;
    // Indicateur sans période (OCS GE) : les millésimes représentés remplacent le sélecteur de période
    millesimes?: React.ReactNode;
    onZoneChange: (zone: string) => void;
    onScaleChange: (scale: string) => void;
    onStartYearChange: (year: number) => void;
    onEndYearChange: (year: number) => void;
    onPeriodChange: (startYear: number, endYear: number) => void;
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
    presetPeriods,
    currentName,
    millesimes,
    onZoneChange,
    onScaleChange,
    onStartYearChange,
    onEndYearChange,
    onPeriodChange,
}) => {
    const inBar = layout === 'bar';
    const Container = inBar ? Bar : Stack;
    const Item = inBar ? Group : Field;
    const land = zoneToLand(zone);

    return (
        <Container role="group" aria-label={millesimes ? 'Zone, maille et millésimes' : 'Zone, maille et période'}>
            <Item>
                <Label $inBar={inBar}>Zone</Label>
                <ZoneSelect $narrow={inBar && Boolean(millesimes)} value={zone} onChange={(e) => onZoneChange(e.target.value)} aria-label="Zone affichée">
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
                    <span>Maille</span>
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
                <Label $inBar={inBar}>{millesimes ? 'Millésimes' : 'Période'}</Label>
                <PeriodSlot $inBar={inBar} $grows={Boolean(millesimes)}>
                    {millesimes ?? (
                        <PeriodSelector
                            startYear={startYear}
                            endYear={endYear}
                            minYear={minYear}
                            maxYear={maxYear}
                            onStartYearChange={onStartYearChange}
                            onEndYearChange={onEndYearChange}
                            dropdownAlign={inBar ? 'right' : 'left'}
                            presets={{ periods: presetPeriods, onSelect: onPeriodChange }}
                        />
                    )}
                </PeriodSlot>
            </Item>
        </Container>
    );
};

export default Controls;
