import React from 'react';
import styled from 'styled-components';

interface DraftTopBarProps {
    name: string;
    typeLabel: string;
    saveStatus: 'saved' | 'saving' | 'error';
    lastSavedTime: Date | null;
    isPdfLoading: boolean;
    onBack: () => void;
    onExport: () => void;
    exportDisabled?: boolean;
}

const TopBar = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid #EBEBEC;
    position: sticky;
    top: 5.4rem;
    z-index: 100;
    border-radius: 5px;
`;

const DraftInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
`;

const DraftName = styled.span`
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-title-grey);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DraftType = styled.span`
    padding: 0.125rem 0.5rem;
    background: var(--background-contrast-blue-france);
    color: var(--text-label-blue-france);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
`;

const DraftActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
`;

const SaveStatus = styled.div<{ $status: 'saved' | 'saving' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    white-space: nowrap;
    color: ${props => {
        switch (props.$status) {
            case 'saved': return 'var(--text-default-success)';
            case 'saving': return 'var(--text-mention-grey)';
            case 'error': return 'var(--text-default-error)';
        }
    }};

    i {
        font-size: 0.875rem;
    }
`;

const DraftTopBar: React.FC<DraftTopBarProps> = ({
    name,
    typeLabel,
    saveStatus,
    lastSavedTime,
    isPdfLoading,
    onBack,
    onExport,
    exportDisabled = false,
}) => {
    return (
        <TopBar>
            <button
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-left-line"
                onClick={onBack}
            >
                Retour
            </button>
            <DraftInfo>
                <DraftName>{name}</DraftName>
                <DraftType>{typeLabel}</DraftType>
            </DraftInfo>
            <DraftActions>
                <SaveStatus $status={saveStatus}>
                    {saveStatus === 'saving' && (
                        <>
                            <span className="fr-spinner fr-spinner--sm" aria-hidden="true" />
                            Enregistrement...
                        </>
                    )}
                    {saveStatus === 'saved' && (
                        <>
                            <i className="bi bi-check-circle-fill" />
                            {lastSavedTime 
                                ? `Enregistré à ${lastSavedTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                                : 'Enregistré'
                            }
                        </>
                    )}
                    {saveStatus === 'error' && (
                        <>
                            <i className="bi bi-exclamation-circle-fill" />
                            Erreur
                        </>
                    )}
                </SaveStatus>
                <button
                    className="fr-btn fr-btn--sm fr-icon-download-line"
                    onClick={onExport}
                    disabled={isPdfLoading || exportDisabled}
                >
                    {isPdfLoading ? 'Export...' : 'Télécharger'}
                </button>
            </DraftActions>
        </TopBar>
    );
};

export default DraftTopBar;

