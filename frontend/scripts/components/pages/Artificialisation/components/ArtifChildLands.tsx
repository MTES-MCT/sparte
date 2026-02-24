import React from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import BaseCard from "@components/ui/BaseCard";
import GuideContent from "@components/ui/GuideContent";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { getLandTypeLabel } from "@utils/landUtils";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

export const ArtifChildLands: React.FC = () => {
  const {
    landId,
    landType,
    childLandTypes,
    childLandType,
    setChildLandType,
    defaultStockIndex,
  } = useArtificialisationContext();

  if (!childLandTypes || childLandTypes.length === 0) {
    return null;
  }

  return (
    <div className="fr-mb-7w">
      <h2>Artificialisation des {getLandTypeLabel(childLandType, true)}</h2>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8">
          {childLandTypes.length > 1 && (
            <div role="tablist" aria-label="Sélection du type de territoire" className="fr-mb-2w">
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
                  aria-label={`Sélectionner ${getLandTypeLabel(child_land_type)}`}
                >
                  {getLandTypeLabel(child_land_type)}
                </button>
              ))}
            </div>
          )}
          <OcsgeGraph
            isMap
            id="artif_map"
            land_id={landId}
            land_type={landType}
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
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <GuideContent title="Comprendre les données">
            <p>Cette carte permet de visualiser la proportion de sols artificialisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols artificialisés est élevée.</p>
            <p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d'artificialisation. La couleur des cercles indique le sens de ce flux : vert pour une désartificialisation nette, rouge pour une artificialisation nette.</p>
          </GuideContent>
        </div>
      </div>
    </div>
  );
};
