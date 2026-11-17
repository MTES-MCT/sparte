import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { ClassRow, Classes, CompactCard, CompactHeader, MethodDetails, Swatch, Title } from './ClassLegend';
import { ValueClass } from './values';

// Légende d'une carte de mailles, posée sur la carte comme la légende des aplats, en bandeau ou en
// colonne : mêmes classes de couleurs, sans effectif par classe (les mailles sont lues dans les
// tuiles, pas comptées). La valeur de la maille survolée est donnée par l'infobulle de la carte.
// La même légende décrit les objets réels quand la carte les dessine à la place des mailles.

// Ce que mesurent les classes
const Basis = styled.p`
    margin: 0;
    padding: 0 0.75rem 0.2rem;
    font-size: ${theme.fontSize.xs};
    line-height: 1.35;
    color: ${theme.colors.textMuted};
`;

interface GridLegendProps {
    indicatorLabel: string;
    // Ce que mesurent les classes, par exemple « Par km², de 2011 à 2024 »
    basis: string;
    classes: ValueClass[];
    method: string;
    // Ligne de ce que la carte laisse sans maille ; null : rien à signaler
    noData: { label: string; color: string } | null;
    // Classe mise en avant : celle de la maille survolée sur la carte, ou la classe épinglée
    activeClass: number | null;
    // Classe épinglée par un clic ou un appui (null : aucune), et sa bascule
    pinnedClass: number | null;
    onTogglePin: (classIndex: number) => void;
}

const GridLegend: React.FC<GridLegendProps> = ({ indicatorLabel, basis, classes, method, noData, activeClass, pinnedClass, onTogglePin }) => (
    <CompactCard>
        <CompactHeader>
            <Title>{indicatorLabel}</Title>
            <MethodDetails>
                <summary>Méthode</summary>
                <p>{method}.</p>
            </MethodDetails>
        </CompactHeader>
        <Basis>{basis}</Basis>
        <Classes aria-label="Classes de valeurs">
            {classes.map((valueClass, index) => (
                <li key={valueClass.name}>
                    {/* Pas de mise en avant au survol : elle redessinerait la carte à chaque passage du pointeur */}
                    <ClassRow
                        type="button"
                        $active={activeClass === index}
                        $pinned={pinnedClass === index}
                        aria-pressed={pinnedClass === index}
                        title="Mettre en avant cette classe sur la carte"
                        onClick={() => onTogglePin(index)}
                    >
                        <Swatch $color={valueClass.color} $active={activeClass === index} aria-hidden="true" />
                        {valueClass.name}
                    </ClassRow>
                </li>
            ))}
            {noData && (
                <li>
                    <ClassRow as="div" $active={false}>
                        <Swatch $color={noData.color} $active={false} aria-hidden="true" />
                        {noData.label}
                    </ClassRow>
                </li>
            )}
        </Classes>
    </CompactCard>
);

export default GridLegend;
