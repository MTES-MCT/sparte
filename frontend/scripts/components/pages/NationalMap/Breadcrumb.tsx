import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import { ParentInfo, zonePath } from './zones';

// Même fil d'Ariane que la carte de la page Consommation des diagnostics :
// icône de lieu, étapes cliquables séparées par des barres obliques
const Nav = styled.nav`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
    min-height: 1.75rem;
    font-size: ${theme.fontSize.sm};
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
    zone: string;
    parent?: ParentInfo | null;
    onZoneChange: (zone: string) => void;
}

// Chemin depuis la France entière jusqu'à la zone affichée ; chaque étape ramène à ce niveau
const Breadcrumb: React.FC<BreadcrumbProps> = ({ zone, parent, onZoneChange }) => {
    const path = zonePath(zone, parent);

    return (
        <Nav aria-label="Fil d'Ariane de la carte">
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
