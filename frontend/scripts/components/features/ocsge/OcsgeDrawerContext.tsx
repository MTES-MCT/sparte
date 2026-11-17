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

// Section ajoutée au tiroir par une page qui a davantage à expliquer (carte nationale)
export interface OcsgeDrawerSection {
    icon: string;
    title: string;
    paragraphs: string[];
}

interface OcsgeDrawerProviderProps {
    millesimes: Millesime[];
    territoryName: string;
    isInterdepartemental: boolean;
    children: ReactNode;
    // Sections placées entre la source des données et les millésimes disponibles ; aucune par défaut
    extraSections?: OcsgeDrawerSection[];
    // Sans l'ombre du tiroir fermé sur le bord de la page (voir Drawer) ; faux par défaut
    flushWhenClosed?: boolean;
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
    extraSections = [],
    flushWhenClosed = false,
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
                flushWhenClosed={flushWhenClosed}
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

                {extraSections.map(({ icon, title, paragraphs }) => (
                    <Section key={title}>
                        <SectionTitle>
                            <i className={icon} />
                            {title}
                        </SectionTitle>
                        {paragraphs.map((paragraph) => (
                            <Paragraph key={paragraph}>{paragraph}</Paragraph>
                        ))}
                    </Section>
                ))}

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
