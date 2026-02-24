import React from "react";
import GenericChart from "@components/charts/GenericChart";
import BaseCard from "@components/ui/BaseCard";
import { useLogementVacantContext } from "../context/LogementVacantContext";

export const LogementVacantMaps: React.FC = () => {
  const { landId, landType, childLandTypes, childType, setChildType, endYear, getLandTypeLabel } =
    useLogementVacantContext();

  if (!childLandTypes.length) return null;

  return (
    <div className="fr-mb-7w">
      <h2 className="fr-h4 fr-mb-3w">
        Cartes de la vacance structurelle des logements
      </h2>

      {childLandTypes.length > 1 && (
        <div className="fr-mb-3w">
          {childLandTypes.map((clt) => (
            <button
              key={clt}
              className={`fr-btn ${
                childType === clt ? "fr-btn--primary" : "fr-btn--tertiary"
              } fr-btn--sm fr-mr-1w`}
              onClick={() => setChildType(clt)}
            >
              {getLandTypeLabel(clt)}
            </button>
          ))}
        </div>
      )}

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-6">
          <BaseCard className="h-100">
            <GenericChart
              key={`logement_vacant_map_percent-${childType}-${endYear}`}
              id="logement_vacant_map_percent"
              land_id={landId}
              land_type={landType}
              params={{
                end_date: String(endYear),
                child_land_type: childType,
              }}
              showDataTable={true}
              isMap={true}
              sources={["lovac", "rpls"]}
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <BaseCard className="h-100">
            <GenericChart
              key={`logement_vacant_map_absolute-${childType}-${endYear}`}
              id="logement_vacant_map_absolute"
              land_id={landId}
              land_type={landType}
              params={{
                end_date: String(endYear),
                child_land_type: childType,
              }}
              showDataTable={true}
              isMap={true}
              sources={["lovac", "rpls"]}
            />
          </BaseCard>
        </div>
      </div>
    </div>
  );
};
