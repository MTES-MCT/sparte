import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandPopDensityQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import { theme } from "@theme";
import Kpi from "@components/ui/Kpi";
import Badge from "@components/ui/Badge";

interface TerritoryIdentityCardProps {
  landData: LandDetailResultType;
  className?: string;
}

const getMockedData = (landData: LandDetailResultType) => ({
  hasCompetenceUrba: landData.land_type === "COMM" || landData.land_type === "EPCI" ? true : null,
  hasObjectifTerritorialise: true,
  objectifPercent: 50,
  hasRecentCogChange: false,
});

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

const DataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const DataSectionLabel = styled.span`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
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
  const mock = getMockedData(landData);

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
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <Kpi
            icon="bi bi-geo-alt-fill"
            label={getLandTypeLabel(landData.land_type)}
            value={landData.name}
            variant="info"
            footer={{
              type: "metric",
              items: [
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
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <Kpi
            icon={mock.hasObjectifTerritorialise ? "bi bi-check-lg" : "bi bi-x-lg"}
            label="Objectif territorialisé (loi ZAN)"
            value={mock.hasObjectifTerritorialise ? `-${mock.objectifPercent}%` : "Non défini"}
            variant={mock.hasObjectifTerritorialise ? "success" : "error"}
            footer={{
              type: "metric",
              items: [
                {
                  icon: mock.hasCompetenceUrba ? "bi bi-check-lg" : "bi bi-x-lg",
                  label: "Compétence urbanisme",
                  value: mock.hasCompetenceUrba ? "Oui" : "Non",
                },
                {
                  icon: mock.hasRecentCogChange ? "bi bi-exclamation-lg" : "bi bi-check-lg",
                  label: "Changement COG récent",
                  value: mock.hasRecentCogChange ? "Oui" : "Non",
                },
              ],
            }}
          />
        </div>
      </div>

      <DataSection>
        <DataSectionLabel>Données disponibles pour ce territoire :</DataSectionLabel>
        <DataSectionBadges>
          {dataCoverage.map((data) => (
            <Badge key={data.key} $variant={data.available ? "active" : "neutral"}>
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
