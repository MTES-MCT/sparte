import React from 'react';
import styled from 'styled-components';

interface DraftCardProps {
    title: string;
    typeLabel: string;
    updatedAt: string;
    onClick: () => void;
    onDelete: () => void;
}

const Card = styled.button`
    background: white;
    border: 1px solid var(--border-default-grey);
    border-radius: 0.25rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: var(--lifted);
    width: 100%;

    &:hover {
        background: var(--artwork-decorative-blue-france);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
`;

const CardTitle = styled.h4`
    margin-bottom: 0;
    flex: 1;
`;

const CardMeta = styled.p`
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--text-mention-grey);
`;

const CardActions = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 0.25rem;
`;

const DraftCard: React.FC<DraftCardProps> = ({
    title,
    typeLabel,
    updatedAt,
    onClick,
    onDelete,
}) => {
    const formattedDate = new Date(updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Voulez-vous vraiment supprimer ce rapport ?')) {
            onDelete();
        }
    };

    return (
        <Card onClick={onClick}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <p className="fr-badge fr-badge--sm">{typeLabel}</p>
            </CardHeader>
            <CardMeta>Modifié le {formattedDate}</CardMeta>
            <CardActions>
                <button
                    className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
                    onClick={handleDelete}
                    title="Supprimer ce rapport"
                >
                    Supprimer
                </button>
            </CardActions>
        </Card>
    );
};

export default DraftCard;

