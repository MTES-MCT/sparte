import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import Badge from '@components/ui/Badge';
import IconBadge from '@components/ui/IconBadge';
import { CLASSIFICATION_LABEL, NO_DATA_COLOR, ValueClass } from './values';

// Même carte que la légende bivariée des diagnostics : en-tête, classes, panneau de détail au survol

const LegendCard = styled(BaseCard)`
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.border};
`;

const Title = styled.h4`
    margin: 0;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};
`;

const Subtitle = styled.p`
    margin: 0.2rem 0 0;
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.textMuted};
`;

// Méthode de discrétisation, en pied de légende
const Method = styled.p`
    margin: 0;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-top: 1px solid ${theme.colors.border};
    font-size: 0.7rem;
    line-height: 1.4;
    color: ${theme.colors.textMuted};
`;

const Classes = styled.ul`
    margin: 0;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    list-style: none;
`;

const ClassRow = styled.li<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.3rem 0.4rem;
    border-radius: 4px;
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.text};
    background: ${({ $active }) => ($active ? theme.colors.backgroundAlt : 'transparent')};
    cursor: default;
    transition: background 0.15s ease;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }
`;

const Swatch = styled.span<{ $color: string; $active: boolean }>`
    width: 1.5rem;
    height: 1.1rem;
    flex-shrink: 0;
    border-radius: 4px;
    background: ${({ $color }) => $color};
    transform: ${({ $active }) => ($active ? 'scale(1.08)' : 'scale(1)')};
    transition: transform 0.15s ease;
`;

const Count = styled.span`
    margin-left: auto;
    color: ${theme.colors.textMuted};
    white-space: nowrap;
`;

const DetailPanel = styled.div<{ $bgColor: string }>`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${({ $bgColor }) => $bgColor};
    border-top: 1px solid ${theme.colors.border};
    min-height: 7rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const DetailHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};
`;

const DetailSwatch = styled.div<{ $color: string }>`
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
`;

const DetailTitle = styled.div`
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};
    line-height: 1.3;
`;

const MetricRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    margin-top: ${theme.spacing.sm};
`;

const MetricLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: ${theme.fontSize.xs};
    flex: 1;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSize.sm};
    text-align: center;

    i {
        font-size: 1.5rem;
        margin-bottom: ${theme.spacing.sm};
        opacity: 0.5;
    }
`;

const hexToRgba = (hex: string, alpha: number): string => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface HoveredLand {
    name: string;
    valueText: string;
    // Indice de classe du territoire, null sans donnée
    classIndex: number | null;
}

interface ClassLegendProps {
    indicatorLabel: string;
    classes: ValueClass[];
    // Nombre de territoires affichés dans chaque classe, puis sans donnée
    counts: number[];
    noDataCount: number;
    landTypeLabel: string;
    // Territoire survolé sur la carte
    hoveredLand?: HoveredLand | null;
    // Appelé quand le pointeur entre sur une classe (ou la quitte : null)
    onClassHover?: (classIndex: number | null) => void;
}

const ClassLegend: React.FC<ClassLegendProps> = ({ indicatorLabel, classes, counts, noDataCount, landTypeLabel, hoveredLand, onClassHover }) => {
    const [hoveredClass, setHoveredClass] = useState<number | null>(null);
    const activeClass = hoveredClass ?? hoveredLand?.classIndex ?? null;
    const activeColor = activeClass !== null ? classes[activeClass]?.color : undefined;

    const enter = (index: number) => {
        setHoveredClass(index);
        onClassHover?.(index);
    };
    const leave = () => {
        setHoveredClass(null);
        onClassHover?.(null);
    };

    const renderDetail = () => {
        if (hoveredLand?.classIndex === null) {
            return (
                <>
                    <DetailHeader>
                        <DetailSwatch $color={NO_DATA_COLOR} />
                        <DetailTitle>{hoveredLand.name}</DetailTitle>
                    </DetailHeader>
                    <MetricRow>
                        <MetricLabel>Donnée non disponible pour ce territoire</MetricLabel>
                    </MetricRow>
                </>
            );
        }
        if (activeClass === null || !classes[activeClass]) {
            return (
                <EmptyState>
                    <i className="bi bi-hand-index" aria-hidden="true" />
                    <span>Survolez une classe ou un territoire pour voir le détail</span>
                </EmptyState>
            );
        }
        const valueClass = classes[activeClass];
        return (
            <>
                <DetailHeader>
                    <DetailSwatch $color={valueClass.color} />
                    <DetailTitle>{valueClass.name}</DetailTitle>
                </DetailHeader>
                <MetricRow>
                    <MetricLabel>
                        <IconBadge icon="bi bi-geo-alt" size={22} variant="light" />
                        <span>{landTypeLabel} dans cette classe</span>
                    </MetricLabel>
                    <Badge variant="primary" size="sm">{counts[activeClass] ?? 0}</Badge>
                </MetricRow>
                {hoveredLand && hoveredLand.classIndex === activeClass && (
                    <MetricRow>
                        <MetricLabel>
                            <IconBadge icon="bi bi-cursor" size={22} variant="light" />
                            <span>{hoveredLand.name}</span>
                        </MetricLabel>
                        <Badge variant="primary" size="sm">{hoveredLand.valueText}</Badge>
                    </MetricRow>
                )}
            </>
        );
    };

    return (
        <LegendCard>
            <Header>
                <Title>Légende</Title>
                <Subtitle>{indicatorLabel}</Subtitle>
            </Header>
            <Classes aria-label="Classes de valeurs">
                {classes.map((valueClass, index) => (
                    <ClassRow key={valueClass.name} $active={activeClass === index} onMouseEnter={() => enter(index)} onMouseLeave={leave}>
                        <Swatch $color={valueClass.color} $active={activeClass === index} aria-hidden="true" />
                        {valueClass.name}
                        <Count>{counts[index] ?? 0}</Count>
                    </ClassRow>
                ))}
                {noDataCount > 0 && (
                    <ClassRow $active={false}>
                        <Swatch $color={NO_DATA_COLOR} $active={false} aria-hidden="true" />
                        Donnée non disponible
                        <Count>{noDataCount}</Count>
                    </ClassRow>
                )}
            </Classes>
            <DetailPanel $bgColor={activeColor ? hexToRgba(activeColor, 0.12) : theme.colors.backgroundAlt}>{renderDetail()}</DetailPanel>
            <Method>{CLASSIFICATION_LABEL}.</Method>
        </LegendCard>
    );
};

export default ClassLegend;
