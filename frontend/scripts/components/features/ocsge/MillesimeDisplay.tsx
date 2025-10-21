import React from 'react';
import { LandArtifStockIndex } from "@services/types/landartifstockindex";

interface MillesimeDisplayProps {
    is_interdepartemental: boolean;
    landArtifStockIndex: LandArtifStockIndex;
    between?: boolean;
    className?: string;
}

export const MillesimeDisplay: React.FC<MillesimeDisplayProps> = ({ 
    is_interdepartemental, 
    landArtifStockIndex,
    between,
    className
}) => {
    const getMillesimeContent = () => {
        if (is_interdepartemental) {
            if (between) {
                return (
                    <>entre le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index - 1}</a> et le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
                );
            }
            return (
                <>au <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
            );
        }
        
        if (between) {
            return (
                <>entre {landArtifStockIndex.flux_previous_years?.[0]} et {landArtifStockIndex.years?.[0]}</>
            );
        }

        return `${landArtifStockIndex.years?.[0]}`;
    };

    return (
        <span className={className}>
            {getMillesimeContent()}
        </span>
    );
}; 