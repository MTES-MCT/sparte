import React from 'react';
import styled from 'styled-components';
import type { StatCategory } from '../../types/layer';

interface StatsBarProps {
    categories: StatCategory[];
}

const StatsContainer = styled.div`
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 18px;
    overflow: hidden;
`;

const StatSegment = styled.div<{ $percent: number; $color: string }>`
    width: ${(props) => props.$percent}%;
    background-color: ${(props) => props.$color};
    position: relative;
`;

export const StatsBar: React.FC<StatsBarProps> = ({ categories }) => {
    // Filtrer les catégories avec un pourcentage > 0
    const visibleCategories = categories.filter(cat => cat.percent > 0);
    
    if (visibleCategories.length === 0) {
        return null;
    }

    return (
        <StatsContainer>
            {visibleCategories.map((category) => (
                <StatSegment
                    key={category.code}
                    $percent={category.percent}
                    $color={category.color}
                    aria-describedby={`tooltip-${category.code}`}
                >
                    <span
                        className="fr-tooltip fr-placement"
                        id={`tooltip-${category.code}`}
                        role="tooltip"
                        aria-hidden="true"
                    >
                        {category.label} - {Math.round(category.percent * 10) / 10}%
                    </span>
                </StatSegment>
            ))}
        </StatsContainer>
    );
};

