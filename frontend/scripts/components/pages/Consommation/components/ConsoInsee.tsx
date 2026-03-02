import React from "react";
import GenericChart from "@components/charts/GenericChart";
import { BivariateMap } from "@components/charts/consommation/BivariateMap";
import Kpi from "@components/ui/Kpi";
import { formatNumber } from "@utils/formatUtils";

interface ConsoInseeProps {
  landId: string;
  landType: string;
  landName?: string;
  startYear: number;
  endYear: number;
  childLandTypes?: string[];
  childType?: string;
  onChildLandTypeChange?: (type: string) => void;
  logements?: number | null;
  evolutionLogementsPercent?: number | null;
  evolutionLogementsAbsolute?: number | null;
  densiteLogements?: number | null;
  emplois?: number | null;
  evolutionEmploisPercent?: number | null;
  evolutionEmploisAbsolute?: number | null;
  densiteEmplois?: number | null;
}

export const ConsoInsee: React.FC<ConsoInseeProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  childLandTypes,
  childType,
  onChildLandTypeChange,
  logements,
  evolutionLogementsPercent,
  evolutionLogementsAbsolute,
  densiteLogements,
  emplois,
  evolutionEmploisPercent,
  evolutionEmploisAbsolute,
  densiteEmplois,
}) => {
  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]);

  return (
    <div className="fr-mt-7w">
      {/* Logement */}
      <h3 className="fr-mt-5w">Consommation d'espaces NAF et logement</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-graph-up-arrow"
            label="Évolution des logements"
            value={evolutionLogementsAbsolute != null
              ? `${evolutionLogementsAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionLogementsAbsolute })}`
              : "n.d."}
            description={evolutionLogementsPercent != null
              ? `${evolutionLogementsPercent > 0 ? "+" : ""}${evolutionLogementsPercent} %`
              : undefined}
            variant="success"
            badge="Donnée clé"
            footer={{
              type: "period",
              periods: [{ label: "2011", active: true }, { label: "2022" }],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-buildings"
            label="Nombre de logements"
            value={logements != null ? formatNumber({ number: logements }) : "n.d."}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: "2022" }],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-grid-3x3-gap"
            label="Densité de logements"
            value={densiteLogements != null ? <>{formatNumber({ number: densiteLogements })} <span>/ ha</span></> : "n.d."}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: "2022" }],
            }}
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMap
            chartId="dc_logement_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
          <BivariateMap
            chartId="dc_vacance_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
        </>
      )}

      {/* Emploi et economie */}
      <h3 className="fr-mt-5w">Consommation d'espaces NAF et emploi</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-graph-up-arrow"
            label="Évolution des emplois"
            value={evolutionEmploisAbsolute != null
              ? `${evolutionEmploisAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionEmploisAbsolute })}`
              : "n.d."}
            description={evolutionEmploisPercent != null
              ? `${evolutionEmploisPercent > 0 ? "+" : ""}${evolutionEmploisPercent} %`
              : undefined}
            variant="success"
            badge="Donnée clé"
            footer={{
              type: "period",
              periods: [{ label: "2011", active: true }, { label: "2022" }],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-briefcase"
            label="Nombre d'emplois"
            value={emplois != null ? formatNumber({ number: emplois }) : "n.d."}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: "2022" }],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4 fr-grid-row">
          <Kpi
            icon="bi bi-grid-3x3-gap"
            label="Densité d'emplois"
            value={densiteEmplois != null ? <>{formatNumber({ number: densiteEmplois })} <span>/ ha</span></> : "n.d."}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: "2022" }],
            }}
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <BivariateMap
          chartId="dc_emploi_conso_map"
          landId={landId}
          landType={landType}
          landName={landName}
          childLandType={mapChildType}
          childLandTypes={childLandTypes}
          onChildLandTypeChange={onChildLandTypeChange}
        />
      )}

      <div className="fr-mb-3w">
        <GenericChart
          id="dc_emploi_vs_conso"
          land_id={landId}
          land_type={landType}
          params={{
            start_date: String(startYear),
            end_date: String(endYear),
          }}
          sources={["insee", "majic"]}
          showDataTable={true}
        />
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMap
            chartId="dc_creations_entreprises_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
          <BivariateMap
            chartId="dc_chomage_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
        </>
      )}

    </div>
  );
};