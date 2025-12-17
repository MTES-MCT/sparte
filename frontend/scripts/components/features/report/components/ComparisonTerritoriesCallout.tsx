import React from 'react';
import styled from 'styled-components';
import { Territory } from '@components/ui/SearchBar';
import { ContentZoneMode } from '../editor/ContentZone';

interface ComparisonTerritoriesCalloutProps {
    territories: Territory[];
    landName: string;
    isDefaultSelection: boolean;
    mode: ContentZoneMode;
    onSettingsClick: () => void;
}

const CalloutEditInfo = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    @media print {
        display: none !important;
    }
`;

const CalloutEditText = styled.p`
    font-size: 0.75rem;
`;

const ComparisonTerritoriesCallout: React.FC<ComparisonTerritoriesCalloutProps> = ({
    territories,
    landName,
    isDefaultSelection,
    mode,
    onSettingsClick,
}) => {
    return (
        <div className="fr-callout">
            <p className="fr-callout__text">
                {isDefaultSelection ? (
                    <>
                        <i className="bi bi-info-circle fr-mr-1w" /> Les <strong>territoires de comparaison</strong> ont été automatiquement sélectionnés en fonction de leur proximité géographique avec le territoire de <strong>{landName}</strong>.
                    </>
                ) : (
                    <>
                        <i className="bi bi-check-circle text-success fr-mr-1w" /> Territoires de comparaison sélectionnés : <strong>{territories.map(t => t.name).join(', ') || 'Aucun'}</strong>
                    </>
                )}
            </p>
            {mode === 'edit' && (
                <CalloutEditInfo>
                    <CalloutEditText className="fr-mb-0">
                        <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" />
                        Les territoires de comparaison peuvent être modifiés dans les paramètres du rapport.
                    </CalloutEditText>
                    <button 
                        className="fr-btn fr-btn--sm fr-mt-0"
                        onClick={onSettingsClick}
                        title="Modifier les territoires"
                    >
                        Modifier
                    </button>
                </CalloutEditInfo>
            )}
        </div>
    );
};

export default ComparisonTerritoriesCallout;
