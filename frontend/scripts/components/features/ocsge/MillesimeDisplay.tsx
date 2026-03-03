import React from 'react';
import { LandArtifStockIndex } from "@services/types/landartifstockindex";
import Button from '@components/ui/Button';
import { useOcsgeDrawer } from './OcsgeDrawerContext';

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
    const drawerContext = useOcsgeDrawer();

    const renderMillesimeRef = (label: string) => {
        if (drawerContext) {
            return (
                <Button
                    variant="link"
                    onClick={drawerContext.openDrawer}
                    title="Voir le détail des millésimes"
                >
                    {label}<sup><i className="bi bi-info-circle" aria-hidden="true" /></sup>
                </Button>
            );
        }
        return <a href="#millesimes-table">{label}</a>;
    };

    if (is_interdepartemental) {
        if (between) {
            return (
                <span className={className}>
                    {capitalize ? 'Entre' : 'entre'} le {renderMillesimeRef(`millésime n°${landArtifStockIndex.millesime_index - 1}`)} et le {renderMillesimeRef(`millésime n°${landArtifStockIndex.millesime_index}`)}
                </span>
            );
        }
        return (
            <span className={className}>
                {capitalize ? 'Au' : 'au'} {renderMillesimeRef(`millésime n°${landArtifStockIndex.millesime_index}`)}
            </span>
        );
    }
    
    if (between) {
        return (
            <span className={className}>
                {capitalize ? 'Entre' : 'entre'} {landArtifStockIndex.flux_previous_years?.[0]} et {landArtifStockIndex.years?.[0]}
            </span>
        );
    }

    return (
        <span className={className}>
            {capitalize ? 'En' : 'en'} {landArtifStockIndex.years?.[0]}
        </span>
    );
};
