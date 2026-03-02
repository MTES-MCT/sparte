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
    title: "Consommation d'espaces",
    description: "Analyse détaillée par destination, évolution démographique, ...",
  },
  {
    key: "trajectoires" as const,
    icon: "bi bi-sliders",
    title: "Simulation de trajectoire",
    description: "Projetez et simulez vos objectifs de réduction",
  },
  {
    key: "artificialisation" as const,
    icon: "bi bi-layers",
    title: "Artificialisation des sols",
    description: "Analyse détaillée des surfaces artificialisées (OCS GE)",
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
    description: "Parc privé, bailleurs sociaux et potentiel de mobilisation",
  },
  {
    key: "friches" as const,
    icon: "bi bi-building-x",
    title: "Friches",
    description: "Localisation, surfaces artificialisées et imperméables",
  },
];

const Container = styled(BaseCard)`
  background: linear-gradient(135deg, ${theme.colors.primaryBg} 0%, white 100%);
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
