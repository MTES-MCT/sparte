import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Loader from '@components/ui/Loader';

interface EditorTopBarProps {
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
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid #EBEBEC;
    position: sticky;
    top: 5.4rem;
    z-index: 100;
`;

const NameSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
`;

const NameButton = styled.button`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-title-grey);
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    max-width: 300px;
    
    span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover {
        background: var(--background-alt-grey);
    }
`;

const NameInput = styled.input`
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border-active-blue-france);
    border-radius: 0.25rem;
    min-width: 200px;
    max-width: 300px;

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--background-contrast-blue-france);
    }
`;

const StatusText = styled.span<{ $status: 'saved' | 'saving' | 'error' }>`
    font-size: 0.75rem;
    color: ${({ $status }) => 
        $status === 'saved' ? 'var(--text-default-success)' :
        $status === 'error' ? 'var(--text-default-error)' :
        'var(--text-mention-grey)'
    };
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const LoaderWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    margin-right: 0.5rem;
`;

const EditorTopBar: React.FC<EditorTopBarProps> = ({
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

    const handleSave = () => {
        const trimmedName = editedName.trim();
        if (trimmedName && trimmedName !== name) {
            onRename(trimmedName);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditedName(name);
            setIsEditing(false);
        }
    };

    const statusLabel = saveStatus === 'saving' ? 'Enregistrement...' :
        saveStatus === 'error' ? 'Erreur' :
        lastSavedTime ? lastSavedTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <TopBar>
            <Button
                priority="tertiary"
                size="small"
                iconId="fr-icon-arrow-left-line"
                onClick={onBack}
                title="Retour à la liste"
            >
                Retour
            </Button>
            <NameSection>
                {isEditing ? (
                    <NameInput
                        ref={inputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    <NameButton onClick={() => setIsEditing(true)} title="Modifier le nom">
                        <span>{name}</span>
                        <span className="fr-icon-edit-line fr-icon--sm" aria-hidden="true" />
                    </NameButton>
                )}
                <Badge small noIcon>{typeLabel}</Badge>
                {statusLabel && (
                    <StatusText $status={saveStatus}>
                        <span className="fr-icon-checkbox-circle-line fr-icon--sm" aria-hidden="true" />
                        {statusLabel}
                    </StatusText>
                )}
            </NameSection>

            <Actions>
                <Button
                    size="small"
                    iconId={isPdfLoading ? undefined : "fr-icon-download-line"}
                    onClick={onExport}
                    disabled={isPdfLoading || exportDisabled}
                >
                    {isPdfLoading && (
                        <LoaderWrapper>
                            <Loader size={16} wrap={false} />
                        </LoaderWrapper>
                    )}
                    {isPdfLoading ? 'Génération...' : 'Télécharger'}
                </Button>
                <Button
                    priority="tertiary"
                    size="small"
                    iconId="fr-icon-delete-line"
                    onClick={() => window.confirm('Supprimer ce rapport ?') && onDelete()}
                    title="Supprimer"
                />
            </Actions>
        </TopBar>
    );
};

export default EditorTopBar;

