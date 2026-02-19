import React from "react";
import styled from "styled-components";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { theme } from "@theme";
import SyntheseConso from "./components/SyntheseConso";
import SyntheseArtif from "./components/SyntheseArtif";
import SyntheseFriche from "./components/SyntheseFriche";
import SyntheseLogementVacant from "./components/SyntheseLogementVacant";
import TerritoryIdentityCard from "./components/TerritoryIdentityCard";
import DiagnosticsHub from "./components/DiagnosticsHub";
import Feedback from '@components/ui/Feedback';

interface SyntheseProps {
  projectData: ProjectDetailResultType;
  landData: LandDetailResultType;
}

const timelineColors = {
  light: { dot: theme.colors.highlight, ring: theme.colors.highlightLight },
  dark: { dot: theme.colors.primary, ring: theme.colors.primaryLight },
} as const;

const TimelineSection = styled.section`
  margin-top: ${theme.spacing.xl};
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2.5rem;

  &::before {
    content: "";
    position: absolute;
    left: 0.55rem;
    top: 0.5rem;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      180deg,
      ${timelineColors.light.dot} 0%,
      ${timelineColors.light.dot} 40%,
      ${timelineColors.dark.dot} 50%,
      ${timelineColors.dark.dot} 85%,
      transparent 100%
    );
    border-radius: 2px;
  }
`;

const TimelineItem = styled.div<{ $variant: "light" | "dark" }>`
  position: relative;
  padding-bottom: ${theme.spacing.xxl};

  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: "";
    position: absolute;
    left: -2.545rem;
    top: 0.35rem;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: ${({ $variant }) => timelineColors[$variant].dot};
    border: 3px solid ${({ $variant }) => timelineColors[$variant].ring};
    box-shadow: 0 0 0 3px ${({ $variant }) => timelineColors[$variant].dot}20;
  }
`;

const TimelineYear = styled.span<{ $variant: "light" | "dark" }>`
  display: inline-block;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.bold};
  padding: ${theme.spacing.xs} 0.6rem;
  border-radius: ${theme.radius};
  margin-bottom: ${theme.spacing.sm};
  background: ${({ $variant }) => timelineColors[$variant].ring};
  color: ${({ $variant }) => timelineColors[$variant].dot};
`;

const TimelineTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const TimelineSubtitle = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  margin: 0 0 1.25rem 0;
`;

const LevierSection = styled.section`
  margin-top: ${theme.spacing.xxl};
  padding: ${theme.spacing.xl} 0;
`;

const LevierIntro = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.text};
  line-height: 1.7;
  max-width: 800px;
  margin-bottom: ${theme.spacing.xl};
`;

const Synthese: React.FC<SyntheseProps> = ({ projectData, landData }) => {
  return (
    <div className="fr-container--fluid fr-p-3w">
      <TerritoryIdentityCard landData={landData} className="fr-mb-7w" />

      <TimelineSection>
        <h2>Comprendre : les objectifs de sobriété foncière</h2>
        <p className="fr-text--sm fr-mb-4w">
          Chaque année, l'équivalent de 4 terrains de football par heure est artificialisé.
          La sobriété foncière vise à protéger les sols et leur rôle vital pour le climat, la biodiversité et l'agriculture, tout en permettant un développement durable des territoires.
          La <strong>loi Climat et Résilience</strong>, consistent à réduire la consommation d'espaces naturels, agricoles et forestiers et à terme de compenser toute nouvelle artificialisation par de la renaturation.
        </p>
        <Timeline>
          <TimelineItem $variant="light">
            <TimelineYear $variant="light">Horizon 2031</TimelineYear>
            <TimelineTitle>Mesure et réduction de la consommation d'espaces</TimelineTitle>
            <TimelineSubtitle>
              Objectif : diviser par deux la consommation d'espaces NAF par rapport à la décennie précédente
            </TimelineSubtitle>
            <SyntheseConso
              landData={landData}
              projectData={projectData}
            />
          </TimelineItem>

          <TimelineItem $variant="dark">
            <TimelineYear $variant="dark">Horizon 2050</TimelineYear>
            <TimelineTitle>Zéro Artificialisation Nette</TimelineTitle>
            <TimelineSubtitle>
              Objectif : compenser toute nouvelle artificialisation par de la renaturation
            </TimelineSubtitle>
            <SyntheseArtif
              landData={landData}
              projectData={projectData}
            />
          </TimelineItem>
        </Timeline>
      </TimelineSection>

      <LevierSection>
        <h2>Agir: Leviers de sobriété foncière</h2>
        <LevierIntro>
          Pour atteindre ces objectifs, plusieurs leviers d'action sont
          identifiés sur votre territoire. Leur activation permet de réduire
          concrètement la consommation d'espaces et l'artificialisation des
          sols.
        </LevierIntro>

        <h3>Vacance des logements</h3>
        <SyntheseLogementVacant
          landData={landData}
          projectData={projectData}
        />

        <h3 className="fr-mt-5w">Réhabilitation des friches</h3>
        <SyntheseFriche
          landData={landData}
          projectData={projectData}
        />
      </LevierSection>

      <section className="fr-mb-6w">
        <DiagnosticsHub
          links={[
            {
              icon: "bi bi-graph-up",
              title: "Consommation d'espaces",
              description: "Analyse détaillée par destination et évolution démographique",
              to: projectData.urls.consommation,
              available: landData.has_conso,
            },
            {
              icon: "bi bi-sliders",
              title: "Simulation de trajectoire",
              description: "Projetez et simulez vos objectifs de réduction",
              to: projectData.urls.trajectoires,
              available: landData.has_conso,
            },
            {
              icon: "bi bi-layers",
              title: "Artificialisation des sols",
              description: "Flux d'artificialisation et couverture OCS GE",
              to: projectData.urls.artificialisation,
              available: landData.has_ocsge,
            },
            {
              icon: "bi bi-layers",
              title: "Imperméabilisation des sols",
              description: "Imperméabilisation des sols",
              to: projectData.urls.impermeabilisation,
              available: landData.has_ocsge,
            },
            {
              icon: "bi bi-house",
              title: "Logements vacants",
              description: "Parc privé, bailleurs sociaux et potentiel de mobilisation",
              to: projectData.urls.logementVacant,
              available: landData.has_logements_vacants_prive || landData.has_logements_vacants_social,
            },
            {
              icon: "bi bi-building-x",
              title: "Friches",
              description: "Localisation, surface et potentiel de réhabilitation",
              to: projectData.urls.friches,
              available: landData.has_friche,
            },
          ]}
        />
      </section>

      <Feedback onSubmit={(rating, comment) => console.log(rating, comment)} />
    </div>
  );
};

export default Synthese;
