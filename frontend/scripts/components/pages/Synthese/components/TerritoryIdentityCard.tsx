import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandPopDensityQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import Badge from "@components/ui/Badge";
import IconBadge from "@components/ui/IconBadge";

interface TerritoryIdentityCardProps {
  landData: LandDetailResultType;
  className?: string;
}

const getLandTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    COMM: "Commune",
    EPCI: "EPCI",
    DEPART: "Département",
    REGION: "Région",
    SCOT: "SCoT",
  };
  return labels[type] || type;
};

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const IdentityCard = styled(BaseCard)`
  padding: 1rem 1.5rem;
  background: ${theme.colors.primaryBg};
`;

const IdentityRow = styled.div`
  display: flex;
  align-items: stretch;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const IdentityItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;

  &:not(:last-child) {
    border-right: 1px solid ${theme.colors.primaryBorder};

    @media (max-width: 768px) {
      border-right: none;
      border-bottom: 1px solid ${theme.colors.primaryBorder};
      padding-bottom: ${theme.spacing.md};
    }
  }
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const ItemLabel = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  font-weight: ${theme.fontWeight.medium};
`;

const ItemValue = styled.span<{ $color?: string }>`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${({ $color }) => $color || theme.colors.text};
`;

const CompetenceIcon = styled.div<{ $hasCompetence: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $hasCompetence }) => ($hasCompetence ? theme.colors.success : theme.colors.error)};
  color: white;

  i {
    font-size: 1rem;
  }
`;

const DataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const DataSectionLabel = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const DataSectionBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

export const TerritoryIdentityCard = ({ landData, className }: TerritoryIdentityCardProps) => {
  const { data: populationData } = useGetLandPopDensityQuery({
    land_id: landData.land_id,
    land_type: landData.land_type,
    year: 2022,
  });

  const population = populationData?.[0]?.population || null;
  const hasCompetenceUrba = landData.competence_planification;
console.log(landData.competence_planification)
  const identityItems = [
    {
      icon: "bi bi-geo-alt-fill",
      label: "Type de territoire",
      value: getLandTypeLabel(landData.land_type),
    },
    {
      icon: "bi bi-bounding-box-circles",
      label: "Surface",
      value: `${formatNumber({ number: landData.surface, decimals: 0 })} ha`,
    },
    {
      icon: "bi bi-people-fill",
      label: "Population",
      value: population ? `${formatNumber({ number: population, decimals: 0 })} hab` : "—",
    },
  ];

  const dataCoverage = [
    { key: "conso", label: "Consommation d'espaces NAF", available: landData.has_conso },
    { key: "ocsge", label: "OCS GE", available: landData.has_ocsge },
    { key: "friches", label: "Friches", available: landData.has_friche },
    { key: "vacants_prive", label: "Logements vacants privés", available: landData.has_logements_vacants_prive },
    { key: "vacants_social", label: "Logements vacants sociaux", available: landData.has_logements_vacants_social },
    { key: "zonage", label: "Zonages d'urbanisme", available: landData.has_zonage },
  ];

  return (
    <Section className={className}>
      <IdentityCard>
        <IdentityRow>
          {identityItems.map((item) => (
            <IdentityItem key={item.label}>
              <IconBadge icon={item.icon} size={36} variant="dark" />
              <ItemContent>
                <ItemLabel>{item.label}</ItemLabel>
                <ItemValue>{item.value}</ItemValue>
              </ItemContent>
            </IdentityItem>
          ))}
          <IdentityItem>
            <CompetenceIcon $hasCompetence={hasCompetenceUrba}>
              <i className={hasCompetenceUrba ? "bi bi-check-lg" : "bi bi-x-lg"} />
            </CompetenceIcon>
            <ItemContent>
              <ItemLabel>Compétence urbanisme</ItemLabel>
              <ItemValue $color={hasCompetenceUrba ? theme.colors.success : theme.colors.error}>
                {hasCompetenceUrba ? "Oui" : "Non"}
              </ItemValue>
            </ItemContent>
          </IdentityItem>
        </IdentityRow>
      </IdentityCard>

      <DataSection>
        <DataSectionLabel>Données disponibles pour ce territoire :</DataSectionLabel>
        <DataSectionBadges>
          {dataCoverage.map((data) => (
            <Badge key={data.key} variant={data.available ? "primary" : "neutral"} size="sm">
              <i className={data.available ? "bi bi-check-lg" : "bi bi-x-lg"} />
              {data.label}
            </Badge>
          ))}
        </DataSectionBadges>
      </DataSection>
    </Section>
  );
};

export default TerritoryIdentityCard;
