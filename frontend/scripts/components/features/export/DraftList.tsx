import React from 'react';
import styled from 'styled-components';
import { ReportDraftListItem } from '@services/types/reportDraft';

const DraftCard = styled.div<{ $selected?: boolean }>`
    padding: 16px;
    border: 2px solid ${props => props.$selected ? 'var(--border-active-blue-france)' : 'var(--border-default-grey)'};
    border-radius: 8px;
    background: ${props => props.$selected ? 'var(--background-alt-blue-france)' : 'white'};
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:hover {
        border-color: var(--border-active-blue-france);
        background: var(--background-alt-grey);
    }
`;

const DraftInfo = styled.div`
    flex: 1;
`;

const DraftName = styled.h4`
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-title-grey);
`;

const DraftMeta = styled.div`
    font-size: 13px;
    color: var(--text-mention-grey);
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`;

const DraftType = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--background-contrast-info);
    color: var(--text-default-info);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
`;

const DeleteButton = styled.button`
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--text-mention-grey);
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
        background: var(--background-alt-red-marianne);
        color: var(--text-default-error);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 32px;
    color: var(--text-mention-grey);
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

interface DraftListProps {
    drafts: ReportDraftListItem[];
    selectedDraftId?: string;
    onSelect: (draft: ReportDraftListItem) => void;
    onDelete: (draftId: string) => void;
    isLoading?: boolean;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const DraftList: React.FC<DraftListProps> = ({
    drafts,
    selectedDraftId,
    onSelect,
    onDelete,
    isLoading,
}) => {
    const handleDelete = (e: React.MouseEvent, draftId: string) => {
        e.stopPropagation();
        if (window.confirm('Voulez-vous vraiment supprimer ce brouillon ?')) {
            onDelete(draftId);
        }
    };

    if (isLoading) {
        return (
            <EmptyState>
                <span className="fr-spinner fr-spinner--sm" aria-hidden="true" />
                <p>Chargement des brouillons...</p>
            </EmptyState>
        );
    }

    if (drafts.length === 0) {
        return (
            <EmptyState>
                <i className="bi bi-file-earmark-text" style={{ fontSize: '48px', opacity: 0.3 }} />
                <p>Aucun brouillon trouvé</p>
            </EmptyState>
        );
    }

    return (
        <ListContainer>
            {drafts.map(draft => (
                <DraftCard
                    key={draft.id}
                    $selected={draft.id === selectedDraftId}
                    onClick={() => onSelect(draft)}
                >
                    <DraftInfo>
                        <DraftName>{draft.name}</DraftName>
                        <DraftMeta>
                            <DraftType>{draft.report_type_display}</DraftType>
                            <span>Modifié le {formatDate(draft.updated_at)}</span>
                        </DraftMeta>
                    </DraftInfo>
                    <DeleteButton
                        onClick={(e) => handleDelete(e, draft.id)}
                        title="Supprimer ce brouillon"
                    >
                        <i className="bi bi-trash" />
                    </DeleteButton>
                </DraftCard>
            ))}
        </ListContainer>
    );
};

export default DraftList;

