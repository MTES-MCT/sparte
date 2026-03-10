import React, { useCallback } from "react";
import GenericChart from "@components/charts/GenericChart";
import { BivariateMap, useMapDrilldown } from "@components/charts/consommation/BivariateMap";
import Kpi from "@components/ui/Kpi";
import Loader from "@components/ui/Loader";
import Button from "@components/ui/Button";
import { formatNumber } from "@utils/formatUtils";
import { djangoApi, useGetSocioEconomicStatsQuery } from "@services/api";
import { useConsommationControls } from "../context/ConsommationControlsContext";

interface ConsoDemographyProps {
  landId: string;
  landType: string;
  landName?: string;
  startYear: number;
  endYear: number;
  childLandTypes?: string[];
  childType?: string;
}

const BIVARIATE_MAPS = [
  { chartId: "dc_population_conso_map", label: "Population" },
  { chartId: "dc_menages_conso_map", label: "Ménages" },
  { chartId: "dc_logement_conso_map", label: "Logements" },
  { chartId: "dc_emploi_conso_map", label: "Emploi" },
  // { chartId: "dc_creations_entreprises_conso_map", label: "Créations d'entreprises" },
  // { chartId: "dc_chomage_conso_map", label: "Chômage" },
];

const formatAnnualValue = (value: number | null | undefined, unit: string, isLoading: boolean) => {
  if (isLoading || value == null) return <Loader size={32} />;
  const sign = value > 0 ? "+" : "";
  return <>{sign}{formatNumber({ number: value, decimals: 0 })} <span>{unit}</span></>;
};

const formatAnnualPercent = (value: number | null | undefined, isLoading: boolean) => {
  if (isLoading || value == null) return undefined;
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber({ number: value, decimals: 2 })} % / an`;
};

export const ConsoDemography: React.FC<ConsoDemographyProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  childLandTypes,
  childType,
}) => {
  const isCommune = landType === "COMM";
  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]) || (isCommune ? "COMM" : undefined);
  const { activeBivariateChartId, setActiveBivariateChartId } = useConsommationControls();
  const drilldown = useMapDrilldown(mapChildType || "");

  const { data: stats, isLoading, isFetching } = useGetSocioEconomicStatsQuery({
    land_id: landId,
    land_type: landType,
    from_year: startYear,
    to_year: endYear,
  });

  const loading = isLoading || isFetching;
  const activeMap = BIVARIATE_MAPS.find((m) => m.chartId === activeBivariateChartId) || BIVARIATE_MAPS[0];

  const currentEntry = drilldown.navStack.at(-1);
  const mapLandId = currentEntry?.land_id ?? landId;
  const mapLandTypeResolved = currentEntry?.land_type ?? landType;
  const mapChildLandType = currentEntry?.child_land_type ?? mapChildType;

  const prefetchChartConfig = djangoApi.usePrefetch("getChartConfig");
  const prefetchChart = useCallback((chartId: string) => {
    if (!mapChildLandType) return;
    prefetchChartConfig({
      id: chartId,
      land_type: mapLandTypeResolved,
      land_id: mapLandId,
      child_land_type: mapChildLandType,
      start_date: String(startYear),
      end_date: String(endYear),
    });
  }, [prefetchChartConfig, mapLandId, mapLandTypeResolved, mapChildLandType, startYear, endYear]);

  return (
    <div className="fr-mt-7w">
      <h3 id="conso-demographie">Consommation d'espaces NAF et dynamiques socio-économiques</h3>
      <p className="fr-text--sm fr-mb-3w">
        Cette section croise la consommation d'espaces NAF avec les principales dynamiques socio-économiques du territoire :
        population, ménages, emplois. Ces indicateurs permettent de mettre en perspective la consommation foncière
        au regard des besoins liés au développement du territoire.
      </p>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <Kpi
            icon="bi bi-people"
            label="Évolution annuelle de la population"
            value={formatAnnualValue(stats?.population_annual_evolution, "hab / an", loading)}
            description={formatAnnualPercent(stats?.population_annual_evolution_percent, loading)}
            variant="default"
            footer={{
              type: "period",
              periods: [
                { label: String(startYear), active: true },
                { label: String(Math.min(endYear, 2022)) },
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <Kpi
            icon="bi bi-house-door"
            label="Évolution annuelle du nombre de ménages"
            value={formatAnnualValue(stats?.menages_annual_evolution, "ménages / an", loading)}
            description={formatAnnualPercent(stats?.menages_annual_evolution_percent, loading)}
            variant="default"
            footer={{
              type: "period",
              periods: [
                { label: String(startYear), active: true },
                { label: String(Math.min(endYear, 2022)) },
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <Kpi
            icon="bi bi-briefcase"
            label="Évolution annuelle du nombre d'emplois"
            value={formatAnnualValue(stats?.emplois_annual_evolution, "emplois / an", loading)}
            description={formatAnnualPercent(stats?.emplois_annual_evolution_percent, loading)}
            variant="default"
            footer={{
              type: "period",
              periods: [
                { label: String(startYear), active: true },
                { label: String(Math.min(endYear, 2022)) },
              ],
            }}
          />
        </div>
      </div>

      <div className="fr-mt-5w">
        <GenericChart
          id="population_conso_progression_chart"
          land_id={landId}
          land_type={landType}
          params={{
            start_date: String(startYear),
            end_date: String(endYear - 1),
          }}
          sources={["majic", "insee"]}
          showDataTable={true}
        >
          <div>
            <h6 className="fr-mb-0">Calcul</h6>
            <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            <p className="fr-text--xs fr-mb-0">
              Évolution estimée = (somme des évolutions annuelles de la population) / (nombre d'années)
            </p>
          </div>
        </GenericChart>
      </div>

      {(hasChildren || isCommune) && mapChildType && (
        <div className="fr-mt-5w">
          <div className="fr-mb-2w d-flex gap-2" style={{ flexWrap: "wrap" }}>
            {BIVARIATE_MAPS.map((map) => (
              <Button
                key={map.chartId}
                variant={activeBivariateChartId === map.chartId ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveBivariateChartId(map.chartId)}
                onMouseEnter={() => prefetchChart(map.chartId)}
              >
                {map.label}
              </Button>
            ))}
          </div>

          <BivariateMap
            chartId={activeMap.chartId}
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            startYear={startYear}
            endYear={endYear}
            drilldown={drilldown}
          />
        </div>
      )}
    </div>
  );
};
