import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandPopDensityQuery } from "@services/api";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { useImpermeabilisation } from "@hooks/useImpermeabilisation";
import { formatNumber } from "@utils/formatUtils";
import { theme } from "@theme";
import StatBlock, { Value, Secondary } from "@components/ui/StatBlock";
import Badge from "@components/ui/Badge";

interface TerritoryIdentityCardProps {
  landData: LandDetailResultType;
  className?: string;
}

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: 1.25rem;
`;

const DataSectionTitle = styled.span`
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${theme.colors.textLight};
  display: block;
  margin-bottom: ${theme.spacing.sm};
`;

const DataTagsRow = styled.div`
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

  const { landArtifStockIndex } = useArtificialisation({ landData });
  const { landImperStockIndex } = useImpermeabilisation({ landData });

  const population = populationData?.[0]?.population || null;
  const density = populationData?.[0]?.density_ha || null;
  const hasOcsgeData = landData.has_ocsge;

  const dataCoverage = [
    { key: "conso", label: "Consommation d'espaces NAF", available: landData.has_conso },
    { key: "ocsge", label: "OCS GE", available: landData.has_ocsge },
    { key: "friches", label: "Friches", available: landData.has_friche },
    { key: "vacants_prive", label: "Logements vacants privés", available: landData.has_logements_vacants_prive },
    { key: "vacants_social", label: "Logements vacants sociaux", available: landData.has_logements_vacants_social },
    { key: "zonage", label: "Zonages d'urbanisme", available: landData.has_zonage },
  ];

  return (
    <div className={className}>
      <StatsGrid>
        <StatBlock icon="bi bi-bounding-box-circles" label="Surface">
          <Value>
            {formatNumber({ number: landData.surface, decimals: 0 })}
            <span>ha</span>
          </Value>
        </StatBlock>

        <StatBlock icon="bi bi-people-fill" label="Population">
          {!population ? (
            <Value>—</Value>
          ) : (
            <>
              <Value>
                {formatNumber({ number: population, decimals: 0 })}
                <span>hab</span>
              </Value>
              <Secondary>
                {density ? `${formatNumber({ number: density, decimals: 2 })} hab/ha · ` : ""}en 2022
              </Secondary>
            </>
          )}
        </StatBlock>

        {hasOcsgeData && (
          <>
            <StatBlock icon="bi bi-buildings-fill" label="Surfaces artificialisées">
              {landArtifStockIndex.surface <= 0 ? (
                <Value>—</Value>
              ) : (
                <>
                  <Value>
                    {formatNumber({ number: landArtifStockIndex.surface, decimals: 0 })}
                    <span>ha</span>
                  </Value>
                  <Secondary>
                    {formatNumber({ number: landArtifStockIndex.percent, decimals: 1 })}% du territoire
                    {landData.years_artif?.length ? ` · en ${landData.years_artif[landData.years_artif.length - 1]}` : ""}
                  </Secondary>
                </>
              )}
            </StatBlock>

            <StatBlock icon="bi bi-droplet-fill" label="Surfaces imperméabilisées">
              {landImperStockIndex.surface <= 0 ? (
                <Value>—</Value>
              ) : (
                <>
                  <Value>
                    {formatNumber({ number: landImperStockIndex.surface, decimals: 0 })}
                    <span>ha</span>
                  </Value>
                  <Secondary>
                    {formatNumber({ number: landImperStockIndex.percent, decimals: 1 })}% du territoire
                    {landData.years_artif?.length ? ` · en ${landData.years_artif[landData.years_artif.length - 1]}` : ""}
                  </Secondary>
                </>
              )}
            </StatBlock>
          </>
        )}
      </StatsGrid>

      <DataSectionTitle>
        Données disponibles pour ce territoire :
      </DataSectionTitle>
      <DataTagsRow>
        {dataCoverage.map((data) => (
          <Badge key={data.key} $variant={data.available ? "active" : "neutral"}>
            <i className={data.available ? "bi bi-check-lg" : "bi bi-x-lg"} />
            {data.label}
          </Badge>
        ))}
      </DataTagsRow>
    </div>
  );
};

export default TerritoryIdentityCard;
