import React from 'react';
import { LandArtifStockIndex } from "@services/types/landartifstockindex";
import styled from 'styled-components';

const MillesimeDisplayContainer = styled.span<{ capitalize?: boolean }>`
    text-transform: ${props => props.capitalize ? 'capitalize' : 'none'};
`;
interface MillesimeDisplayProps {
    is_interdepartemental: boolean;
    landArtifStockIndex: LandArtifStockIndex;
    between?: boolean;
    className?: string;
    capitalize?: boolean;
}

export const MillesimeDisplay: React.FC<MillesimeDisplayProps> = ({ 
    is_interdepartemental, 
    landArtifStockIndex,
    between = false,
    className,
    capitalize = false
}) => {
    const getMillesimeContent = () => {
        if (is_interdepartemental) {
            if (between) {
                return (
                    <>{capitalize ? 'Entre' : 'entre'} le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index - 1}</a> et le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
                );
            }
            return (
                <>{capitalize ? 'Au' : 'au'} <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
            );
        }
        
        if (between) {
            return (
                <>{capitalize ? 'Entre' : 'entre'} {landArtifStockIndex.flux_previous_years?.[0]} et {landArtifStockIndex.years?.[0]}</>
            );
        }

        return `${capitalize ? 'En' : 'en'} ${landArtifStockIndex.years?.[0]}`;
    };

    return (
        <MillesimeDisplayContainer className={className}>
            {getMillesimeContent()}
        </MillesimeDisplayContainer>
    );
}; 