import React from "react";
import GenericChart from "@components/charts/GenericChart";
import Card from "@components/ui/Card";
import { formatNumber } from "@utils/formatUtils";
import { BivariateMapSection } from "./BivariateMapSection";

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
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-graph-up-arrow"
            badgeClass="fr-badge--info"
            badgeLabel="Évolution des logements"
            value={evolutionLogementsAbsolute != null
              ? `${evolutionLogementsAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionLogementsAbsolute })}`
              : "n.d."}
            label={evolutionLogementsPercent != null
              ? `Entre 2011 et 2022 (${evolutionLogementsPercent > 0 ? "+" : ""}${evolutionLogementsPercent} %)`
              : "Entre 2011 et 2022"}
            isHighlighted={true}
            highlightBadge="Donnée clé"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-buildings"
            badgeClass="fr-badge--info"
            badgeLabel="Nombre de logements"
            value={logements != null ? formatNumber({ number: logements }) : "n.d."}
            label="En 2022"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-grid-3x3-gap"
            badgeClass="fr-badge--info"
            badgeLabel="Densité de logements"
            value={densiteLogements != null ? `${formatNumber({ number: densiteLogements })} / ha` : "n.d."}
            label="En 2022"
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMapSection
            chartId="dc_logement_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
          <BivariateMapSection
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
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-graph-up-arrow"
            badgeClass="fr-badge--info"
            badgeLabel="Évolution des emplois"
            value={evolutionEmploisAbsolute != null
              ? `${evolutionEmploisAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionEmploisAbsolute })}`
              : "n.d."}
            label={evolutionEmploisPercent != null
              ? `Entre 2011 et 2022 (${evolutionEmploisPercent > 0 ? "+" : ""}${evolutionEmploisPercent} %)`
              : "Entre 2011 et 2022"}
            isHighlighted={true}
            highlightBadge="Donnée clé"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-briefcase"
            badgeClass="fr-badge--info"
            badgeLabel="Nombre d'emplois"
            value={emplois != null ? formatNumber({ number: emplois }) : "n.d."}
            label="En 2022"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-grid-3x3-gap"
            badgeClass="fr-badge--info"
            badgeLabel="Densité d'emplois"
            value={densiteEmplois != null ? `${formatNumber({ number: densiteEmplois })} / ha` : "n.d."}
            label="En 2022"
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <BivariateMapSection
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
        <div className="bg-white fr-p-2w rounded">
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
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMapSection
            chartId="dc_creations_entreprises_conso_map"
            landId={landId}
            landType={landType}
            landName={landName}
            childLandType={mapChildType}
            childLandTypes={childLandTypes}
            onChildLandTypeChange={onChildLandTypeChange}
          />
          <BivariateMapSection
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
