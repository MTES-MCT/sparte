import React, { useState, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import Drawer from "@components/ui/Drawer";
import IconBadge from "@components/ui/IconBadge";

type SectionKey = "definition" | "donnees" | "reglementation";

export interface TriptychSection {
  content: ReactNode;
  preview?: string;
}

interface TriptychProps {
  definition: TriptychSection;
  donnees: TriptychSection;
  cadreReglementaire?: TriptychSection;
  className?: string;
}

interface SectionConfig {
  key: SectionKey;
  title: string;
  icon: string;
}

const Container = styled(BaseCard)`
  display: flex;
  padding: 0;
  overflow: hidden;
`;

const Section = styled.button`
  all: unset;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.backgroundSubtle} !important;
  }

  &:not(:last-child) {
    border-right: 1px solid ${theme.colors.border};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SectionTitle = styled.span`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const SectionPreview = styled.p`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textLight};
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SectionCta = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.primary};
  font-weight: ${theme.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-top: auto;

  i {
    font-size: 0.6rem;
    transition: transform 0.2s ease;
  }

  ${Section}:hover & i {
    transform: translateX(3px);
  }
`;

const DrawerContent = styled.div`
  p,
  ul,
  li {
    font-size: ${theme.fontSize.sm};
    line-height: 1.7;
    margin-bottom: ${theme.spacing.sm};

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    padding-left: ${theme.spacing.lg};
  }

  a {
    color: ${theme.colors.primary};

    &:hover {
      color: ${theme.colors.hover};
    }
  }
`;

const SECTIONS_CONFIG: SectionConfig[] = [
  { key: "definition", title: "Définition", icon: "bi bi-book" },
  { key: "donnees", title: "Données", icon: "bi bi-database" },
  { key: "reglementation", title: "Réglementation", icon: "bi bi-shield-check" },
];

const Triptych: React.FC<TriptychProps> = ({
  definition,
  donnees,
  cadreReglementaire,
  className,
}) => {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const sections: Record<SectionKey, TriptychSection | undefined> = {
    definition,
    donnees,
    reglementation: cadreReglementaire,
  };

  const visibleSections = SECTIONS_CONFIG.filter((s) => sections[s.key]);
  const activeSection = openSection ? sections[openSection] : null;
  const activeConfig = SECTIONS_CONFIG.find((s) => s.key === openSection);

  return (
    <>
      <Container className={className}>
        {visibleSections.map((config) => {
          const section = sections[config.key]!;
          return (
            <Section
              key={config.key}
              type="button"
              onClick={() => setOpenSection(config.key)}
              aria-label={`Ouvrir ${config.title}`}
            >
              <SectionHeader>
                <IconBadge icon={config.icon} size={34} variant="light" />
                <SectionTitle>{config.title}</SectionTitle>
              </SectionHeader>
              {section.preview && (
                <SectionPreview>{section.preview}</SectionPreview>
              )}
              <SectionCta>
                En savoir plus <i className="bi bi-chevron-right" />
              </SectionCta>
            </Section>
          );
        })}
      </Container>

      <Drawer
        isOpen={openSection !== null}
        title={activeConfig?.title ?? ""}
        onClose={() => setOpenSection(null)}
      >
        <DrawerContent>{activeSection?.content}</DrawerContent>
      </Drawer>
    </>
  );
};

export default Triptych;
