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
}) => (
    <span className={className}>
        {is_interdepartemental ? (
            between ? (
                <>entre le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index - 1}</a> et le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
            ) : (
                <>au <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
            )
        ) : (
            between ? (
                <>entre {landArtifStockIndex.flux_previous_years?.[0]} et {landArtifStockIndex.years?.[0]}</>
            ) : (
                `en ${landArtifStockIndex.years?.[0]}`
            )
        )}
    </span>
); 