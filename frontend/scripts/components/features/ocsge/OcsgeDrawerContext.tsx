import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Drawer from '@components/ui/Drawer';
import { Millesime } from '@services/types/land';
import { LandMillesimeTable } from './LandMillesimeTable';

interface OcsgeDrawerContextValue {
    openDrawer: () => void;
}

const OcsgeDrawerContext = createContext<OcsgeDrawerContextValue | null>(null);

export const useOcsgeDrawer = () => useContext(OcsgeDrawerContext);

interface OcsgeDrawerProviderProps {
    millesimes: Millesime[];
    territoryName: string;
    isInterdepartemental: boolean;
    children: ReactNode;
}

const Section = styled.div`
    margin-bottom: ${theme.spacing.xl};

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h4`
    font-size: ${theme.fontSize.md};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};
    margin: 0 0 ${theme.spacing.md} 0;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    i {
        color: ${theme.colors.primary};
    }
`;

const Paragraph = styled.p`
    font-size: ${theme.fontSize.sm};
    line-height: 1.7;
    color: ${theme.colors.text};
    margin: 0 0 ${theme.spacing.sm} 0;

    &:last-child {
        margin-bottom: 0;
    }

    a {
        color: ${theme.colors.primary};

        &:hover {
            color: ${theme.colors.primaryHover};
        }
    }
`;

export const OcsgeDrawerProvider: React.FC<OcsgeDrawerProviderProps> = ({
    millesimes,
    territoryName,
    isInterdepartemental,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const openDrawer = useCallback(() => setIsOpen(true), []);
    const closeDrawer = useCallback(() => setIsOpen(false), []);

    return (
        <OcsgeDrawerContext.Provider value={{ openDrawer }}>
            {children}
            <Drawer
                isOpen={isOpen}
                title="Comprendre les données OCS GE"
                onClose={closeDrawer}
            >
                <Section>
                    <SectionTitle>
                        <i className="bi bi-database" />
                        Source des données
                    </SectionTitle>
                    <Paragraph>
                        La mesure de l'artificialisation et de l'imperméabilisation d'un territoire repose sur la donnée <strong>OCS GE (Occupation du Sol à Grande Échelle)</strong>, base de données de référence pour la description de l'occupation du sol.
                    </Paragraph>
                    <Paragraph>
                        Cette donnée est produite par l'IGN tous les 3 ans pour chaque département. Chaque production est appelée un <strong>millésime</strong>.
                    </Paragraph>
                    <Paragraph>
                        Ces données sont disponibles en téléchargement sur le site de l'IGN : <a href="https://geoservices.ign.fr/ocsge" target="_blank" rel="noopener noreferrer">geoservices.ign.fr</a>
                    </Paragraph>
                </Section>

                <Section>
                    <SectionTitle>
                        <i className="bi bi-calendar3" />
                        Millésimes disponibles
                    </SectionTitle>
                    <LandMillesimeTable
                        millesimes={millesimes}
                        territory_name={territoryName}
                        is_interdepartemental={isInterdepartemental}
                    />
                </Section>
            </Drawer>
        </OcsgeDrawerContext.Provider>
    );
};
