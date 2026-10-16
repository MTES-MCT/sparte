import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import ActionCard from "@components/ui/ActionCard";
import { ProjectUrls } from "@utils/projectUrls";

interface DiagnosticsHubProps {
  urls: ProjectUrls;
}

const DIAGNOSTICS = [
  {
    key: "consommation" as const,
    icon: "bi bi-graph-up",
    title: "Consommation d'ENAF",
    description: "Analyse détaillée à la maille communale",
  },
  {
    key: "trajectoires" as const,
    icon: "bi bi-sliders",
    title: "Trajectoire de sobriété foncière",
    description: "Analyse du rythme de consommation et projection d'objectifs de réduction",
  },
  {
    key: "artificialisation" as const,
    icon: "bi bi-layers",
    title: "Artificialisation des sols",
    description: "Analyse détaillée des stocks et des flux (OCS GE)",
  },
  {
    key: "impermeabilisation" as const,
    icon: "bi bi-droplet",
    title: "Imperméabilisation des sols",
    description: "Analyse détaillée des surfaces imperméables (OCS GE)",
  },
  {
    key: "logementVacant" as const,
    icon: "bi bi-house",
    title: "Logements vacants",
    description: "Potentiel de mobilisation des logements du parc privé et du parc social",
  },
  {
    key: "friches" as const,
    icon: "bi bi-building-x",
    title: "Friches",
    description: "Analyse du potentiel de friches à réhabiliter",
  },
];

const Container = styled(BaseCard)`
  background: ${theme.colors.primaryBg};
`;

const Title = styled.h4`
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  i {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textLight};
  margin: 0 0 ${theme.spacing.lg} 0;
  max-width: 600px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
`;

const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({ urls }) => (
  <Container className="fr-p-3w">
    <Title>
      <i className="bi bi-compass" />
      Explorer les diagnostics détaillés
    </Title>
    <Subtitle>
      Approfondissez votre analyse avec nos outils de diagnostic spécialisés
    </Subtitle>
    <Grid>
      {DIAGNOSTICS.map((diag) => (
        <ActionCard
          key={diag.key}
          icon={diag.icon}
          title={diag.title}
          description={diag.description}
          to={urls[diag.key]}
        />
      ))}
    </Grid>
  </Container>
);

export default DiagnosticsHub;
