import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import { BREADCRUMB_LINE_HEIGHT } from './layoutStyles';

// Même fil d'Ariane que la carte de la page Consommation des diagnostics :
// icône de lieu, étapes cliquables séparées par des barres obliques.
// Au-dessus de la carte, il passe à la ligne quand la place manque. Dans la barre de titre, il
// tient sur une ligne de hauteur fixe, pour que le titre et la carte ne bougent pas d'une zone à
// l'autre : seule la dernière étape, que le titre répète, est coupée si le chemin est trop long.
const Nav = styled.nav<{ $inBar: boolean }>`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
    min-height: 1.75rem;
    font-size: ${theme.fontSize.sm};

    ${({ $inBar }) =>
        $inBar &&
        css`
            flex-wrap: nowrap;
            min-width: 0;
            min-height: 0;
            height: ${BREADCRUMB_LINE_HEIGHT};
            font-size: ${theme.fontSize.xs};
            line-height: ${BREADCRUMB_LINE_HEIGHT};
            white-space: nowrap;

            > * {
                flex-shrink: 0;
            }

            > [aria-current] {
                flex-shrink: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `}
`;

const Icon = styled.i`
    margin-right: 0.15rem;
    font-size: 0.85rem;
    opacity: 0.4;
`;

const Separator = styled.span`
    opacity: 0.4;
`;

const Current = styled.span`
    font-weight: ${theme.fontWeight.medium};
`;

interface BreadcrumbProps {
    // Chemin depuis la France entière jusqu'à la zone affichée
    path: { zone: string; label: string }[];
    onZoneChange: (zone: string) => void;
    // Dans la barre de titre, sur une ligne de hauteur fixe ; sinon au-dessus de la carte
    inBar?: boolean;
}

// Chaque étape du chemin ramène à son niveau ; la dernière est la zone affichée
const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onZoneChange, inBar = false }) => {
    // Dans la barre de titre, un chemin d'une seule étape ne ferait que répéter le titre posé sous
    // lui : la ligne reste réservée, vide
    if (inBar && path.length < 2) return <Nav as="div" $inBar aria-hidden="true" />;

    return (
        <Nav $inBar={inBar} aria-label="Fil d'Ariane de la carte">
            <Icon className="bi bi-geo-alt" aria-hidden="true" />
            {path.map((step, index) => (
                <React.Fragment key={step.zone}>
                    {index > 0 && <Separator aria-hidden="true">/</Separator>}
                    {index === path.length - 1 ? (
                        <Current aria-current="page">{step.label}</Current>
                    ) : (
                        <Button type="button" variant="tertiary" noBackground noPadding size="sm" onClick={() => onZoneChange(step.zone)}>
                            {step.label}
                        </Button>
                    )}
                </React.Fragment>
            ))}
        </Nav>
    );
};

export default Breadcrumb;
