import React, { useCallback } from "react";
import Kpi from "@components/ui/Kpi";
import GenericChart from "@components/charts/GenericChart";
import Button from "@components/ui/Button";
import Loader from "@components/ui/Loader";
import { formatNumber } from "@utils/formatUtils";
import { useMapDrilldown } from "@components/charts/consommation/BivariateMap";
import { useConsommationControls } from "../context/ConsommationControlsContext";

const CHILD_LAND_TYPE_MAP: Record<string, string> = {
  REGION: "DEPART",
  DEPART: "EPCI",
  SCOT: "COMM",
  EPCI: "COMM",
};

interface ConsoAnnuelleProps {
  landId: string;
  landType: string;
  landName: string;
  childLandTypes: string[];
}

export const ConsoAnnuelle: React.FC<ConsoAnnuelleProps> = ({
  landId,
  landType,
  landName,
  childLandTypes,
}) => {
  const {
    startYear,
    endYear,
    childType,
    consoCardRef,
    totalConsoHa,
    isLoadingConso,
  } = useConsommationControls();

  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]);
  const drilldown = useMapDrilldown(mapChildType || "");

  const currentEntry = drilldown.navStack.at(-1) ?? null;
  const mapLandId = currentEntry?.land_id ?? landId;
  const mapLandType = currentEntry?.land_type ?? landType;
  const mapChildLandType = currentEntry?.child_land_type ?? mapChildType;

  const handleMapPointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      const pointLandType = point.land_type || mapChildLandType;
      const nextChildType = CHILD_LAND_TYPE_MAP[pointLandType];
      if (!nextChildType) return;
      drilldown.push({
        land_id: point.land_id,
        land_type: pointLandType,
        name: point.name,
        child_land_type: nextChildType,
      });
    },
    [mapChildLandType, drilldown]
  );

  return (
    <div>
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row" ref={consoCardRef}>
          <Kpi
            icon="bi-bar-chart"
            label="Consommation d'espaces"
            value={
              isLoadingConso || totalConsoHa === null ? (
                <Loader size={32} />
              ) : (
                <>
                  {formatNumber({ number: totalConsoHa, addSymbol: true })}{" "}
                  <span>ha</span>
                </>
              )
            }
            variant="default"
            badge="Donnée clé"
            footer={{
              type: "period",
              from: String(startYear),
              to: String(endYear),
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
          <GenericChart
            id="chart_determinant"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            </div>
          </GenericChart>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            id="pie_determinant"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            </div>
          </GenericChart>
        </div>

        {hasChildren && (
          <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
            {drilldown.navStack.length > 0 && (
              <nav className="fr-mb-1w" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} aria-label="Fil d'ariane de la carte">
                <i className="bi bi-geo-alt" aria-hidden="true" style={{ opacity: 0.4, fontSize: "0.85rem" }} />
                <Button variant="tertiary" noBackground noPadding size="sm" onClick={() => drilldown.navigateTo(0)}>
                  {landName}
                </Button>
                {drilldown.navStack.map((entry, i) => (
                  <React.Fragment key={entry.land_id}>
                    <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>
                    {i < drilldown.navStack.length - 1 ? (
                      <Button variant="tertiary" noBackground noPadding size="sm" onClick={() => drilldown.navigateTo(i + 1)}>
                        {entry.name}
                      </Button>
                    ) : (
                      <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{entry.name}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
            <GenericChart
              key={`conso_map_relative-${mapLandId}-${mapChildLandType}-${startYear}-${endYear}`}
              id="conso_map_relative"
              land_id={mapLandId}
              land_type={mapLandType}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
                child_land_type: mapChildLandType,
              }}
              sources={["majic"]}
              showDataTable={true}
              showMailleIndicator={childLandTypes.length > 1}
              isMap={true}
              onPointClick={CHILD_LAND_TYPE_MAP[mapChildLandType || ""] ? handleMapPointClick : undefined}
            >
              <div>
                <h6 className="fr-mb-0">Comprendre la carte</h6>
                <p className="fr-text--xs fr-mb-0">
                  Cette carte permet de visualiser la consommation d'espaces NAF
                  relative à la surface de chaque territoire, représentée par
                  l'intensité de la couleur : plus la teinte est foncée, plus la
                  consommation d'espaces est importante par rapport à la surface
                  du territoire.
                </p>
              </div>
            </GenericChart>
          </div>
        )}
      </div>
    </div>
  );
};
