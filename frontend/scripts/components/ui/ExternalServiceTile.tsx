import React from 'react';
import styled from 'styled-components';
import Tile from "@codegouvfr/react-dsfr/Tile";

interface ExternalServiceTileProps {
    imageUrl: string;
    imageAlt: string;
    title: string;
    description: string;
    href: string;
    titleAs?: "h2" | "h3" | "h4" | "h5" | "h6";
}

const StyledTile = styled(Tile)`
    .fr-tile__header {
        min-height: 30%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .fr-tile__img {
        margin: 0;
        width: 100%;
        height: 100%;
    }

    img {
        max-height: 100% !important;
        width: auto !important;
        max-width: 30% !important;
    }

    .fr-tile__desc {
        font-size: 0.8rem;
        line-height: 1.2rem;
        margin-top: 0.8rem;
    }
`;

export const ExternalServiceTile: React.FC<ExternalServiceTileProps> = ({
    imageUrl,
    imageAlt,
    title,
    description,
    href,
    titleAs = "h4"
}) => {
    return (
        <StyledTile
            enlargeLinkOrButton
            imageUrl={imageUrl}
            linkProps={{
                href,
                target: '_blank',
                rel: 'noopener noreferrer external'
            }}
            title={title}
            desc={description}
            titleAs={titleAs}
            small
            imageAlt={imageAlt}
        />
    );
};

export default ExternalServiceTile;

