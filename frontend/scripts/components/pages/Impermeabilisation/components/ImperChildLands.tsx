import React from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import GuideContent from "@components/ui/GuideContent";
import BaseCard from "@components/ui/BaseCard";
import { getLandTypeLabel } from "@utils/landUtils";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperChildLands: React.FC = () => {
  const {
    land_id,
    land_type,
    childLandTypes,
    childLandType,
    setChildLandType,
    defaultStockIndex,
  } = useImpermeabilisationContext();

  if (!childLandTypes.length) return null;

  return (
    <div className="fr-mb-7w">
      <h2>
        Imperméabilisation des {getLandTypeLabel(childLandType, true)} du
        territoire
      </h2>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8">
          <BaseCard className="h-100">
            {childLandTypes.length > 1 && (
              <div role="tablist" aria-label="Sélection du type de territoire">
                {childLandTypes.map((child_land_type) => (
                  <button
                    className={`fr-btn ${
                      childLandType === child_land_type
                        ? "fr-btn--primary"
                        : "fr-btn--tertiary"
                    }`}
                    key={child_land_type}
                    onClick={() => setChildLandType(child_land_type)}
                    role="tab"
                    aria-selected={childLandType === child_land_type}
                    aria-label={`Sélectionner ${getLandTypeLabel(
                      child_land_type
                    )}`}
                  >
                    {getLandTypeLabel(child_land_type)}
                  </button>
                ))}
              </div>
            )}
            <OcsgeGraph
              isMap
              id="imper_map"
              land_id={land_id}
              land_type={land_type}
              containerProps={{
                style: {
                  height: "500px",
                  width: "100%",
                },
              }}
              params={{
                index: defaultStockIndex,
                previous_index: defaultStockIndex - 1,
                child_land_type: childLandType,
              }}
              sources={["ocsge"]}
              showDataTable={true}
            >
              <DetailsCalculationOcsge />
            </OcsgeGraph>
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <GuideContent title="Comprendre les données">
            <p>
              Cette carte permet de visualiser la proportion de surfaces
              imperméables sur un territoire, représentée par l'intensité de la
              couleur de fond : plus la teinte est foncée, plus la part de
              surfaces imperméables est élevée.
            </p>
            <p>
              L'évolution entre les deux millésimes est illustrée par des
              cercles, dont la taille est proportionnelle à
              l'imperméabilisation. La couleur des cercles indique le sens de ce
              flux : vert pour une désimperméabilisation nette, rouge pour une
              imperméabilisation nette.
            </p>
          </GuideContent>
        </div>
      </div>
    </div>
  );
};
