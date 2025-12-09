import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface DraftTopBarProps {
    name: string;
    typeLabel: string;
    saveStatus: 'saved' | 'saving' | 'error';
    lastSavedTime: Date | null;
    isPdfLoading: boolean;
    onBack: () => void;
    onExport: () => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
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

const DraftNameWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
`;

const DraftNameDisplay = styled.button`
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-title-grey);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    margin: -0.25rem -0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    text-align: left;
    max-width: 100%;

    &:hover {
        background: var(--background-alt-grey);
    }
`;

const DraftNameInput = styled.input`
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-title-grey);
    background: white;
    border: 1px solid var(--border-active-blue-france);
    padding: 0.25rem 0.5rem;
    margin: -0.25rem -0.5rem;
    border-radius: 0.25rem;
    outline: none;
    min-width: 200px;
    max-width: 400px;

    &:focus {
        box-shadow: 0 0 0 2px var(--background-contrast-blue-france);
    }
`;

const EditIcon = styled.i`
    font-size: 0.75rem;
    color: var(--text-mention-grey);
    flex-shrink: 0;
`;

const DraftType = styled.span`
    padding: 0.125rem 0.5rem;
    background: var(--background-contrast-blue-france);
    color: var(--text-label-blue-france);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
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
    onRename,
    onDelete,
    exportDisabled = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedName(name);
    }, [name]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditedName(name);
    };

    const handleSave = () => {
        const trimmedName = editedName.trim();
        if (trimmedName && trimmedName !== name) {
            onRename(trimmedName);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedName(name);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <TopBar>
            <button
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-left-line"
                onClick={onBack}
            >
                Retour
            </button>
            <DraftInfo>
                <DraftNameWrapper>
                    {isEditing ? (
                        <DraftNameInput
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <DraftNameDisplay onClick={handleStartEdit} title="Cliquer pour modifier le nom">
                            {name}
                            <EditIcon className="fr-icon-edit-line fr-ml-1v" aria-hidden="true" />
                        </DraftNameDisplay>
                    )}
                </DraftNameWrapper>
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
                <button
                    className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line"
                    onClick={() => {
                        if (window.confirm('Voulez-vous vraiment supprimer ce rapport ?')) {
                            onDelete();
                        }
                    }}
                    title="Supprimer ce rapport"
                >
                    Supprimer
                </button>
            </DraftActions>
        </TopBar>
    );
};

export default DraftTopBar;
