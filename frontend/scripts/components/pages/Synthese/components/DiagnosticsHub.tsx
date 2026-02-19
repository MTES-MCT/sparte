import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import ActionCard from "@components/ui/ActionCard";

interface DiagnosticLink {
  icon: string;
  title: string;
  description: string;
  to: string;
  available: boolean;
}

interface DiagnosticsHubProps {
  links: DiagnosticLink[];
}

const Container = styled(BaseCard)`
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primaryLight} 0%, white 100%);
`;

const Title = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
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

const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({ links }) => {
  const availableLinks = links.filter((link) => link.available);

  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <Container>
      <Title>
        <i className="bi bi-compass" />
        Explorer les diagnostics détaillés
      </Title>
      <Subtitle>
        Approfondissez votre analyse avec nos outils de diagnostic spécialisés
      </Subtitle>
      <Grid>
        {links.map((link, index) => (
          <ActionCard
            key={index}
            icon={link.icon}
            title={link.title}
            description={link.description}
            to={link.available ? link.to : undefined}
            disabled={!link.available}
          />
        ))}
      </Grid>
    </Container>
  );
};

export default DiagnosticsHub;
