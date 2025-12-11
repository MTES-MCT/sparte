import React from 'react';
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

interface DraftCardProps {
    title: string;
    typeLabel: string;
    updatedAt: string;
    onClick: () => void;
}

const DraftCard: React.FC<DraftCardProps> = ({
    title,
    typeLabel,
    updatedAt,
    onClick,
}) => {
    const formattedDate = new Date(updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Tile
            title={title}
            detail={`Modifié le ${formattedDate}`}
            start={<Badge small>{typeLabel}</Badge>}
            buttonProps={{
                onClick: onClick,
            }}
            orientation="vertical"
            small
            titleAs='h4'
        />
    );
};

export default DraftCard;
