import React from "react";
import GenericChart from "@components/charts/GenericChart";
import Button from "@components/ui/Button";
import { useConsommationControls } from "../context/ConsommationControlsContext";

interface ConsoMapsProps {
  landId: string;
  landType: string;
  childLandTypes: string[];
}

export const ConsoMaps: React.FC<ConsoMapsProps> = ({
  landId,
  landType,
  childLandTypes,
}) => {
  const {
    startYear,
    endYear,
    childType,
    setChildType,
    landTypeLabels,
  } = useConsommationControls();

  if (!childLandTypes || childLandTypes.length === 0) {
    return null;
  }

  return (
    <div className="fr-mb-7w fr-mt-5w">
      <h3 id="conso-map">Cartes de consommation d'espaces</h3>

      {childLandTypes.length > 1 && (
        <div className="fr-mb-3w d-flex gap-2">
          {childLandTypes.map((childLandType) => (
            <Button
              key={childLandType}
              variant={childType === childLandType ? "primary" : "secondary"}
              size="sm"
              onClick={() => setChildType(childLandType)}
            >
              {landTypeLabels[childLandType] || childLandType}
            </Button>
          ))}
        </div>
      )}

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            key={`conso_map_relative-${childType}-${startYear}-${endYear}`}
            id="conso_map_relative"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
              child_land_type: childType,
            }}
            sources={["majic"]}
            showDataTable={true}
            isMap={true}
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
              <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
              <p className="fr-text--xs fr-mb-0">
                Les données proviennent des{" "}
                <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
              </p>
            </div>
          </GenericChart>
        </div>

        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            key={`conso_map_bubble-${childType}-${startYear}-${endYear}`}
            id="conso_map_bubble"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
              child_land_type: childType,
            }}
            sources={["majic"]}
            showDataTable={true}
            isMap={true}
          >
            <div>
              <h6 className="fr-mb-0">Comprendre la carte</h6>
              <p className="fr-text--xs fr-mb-0">
                Cette carte permet de visualiser les flux de consommation
                d'espaces NAF par territoire : la taille des cercles est
                proportionnelle à la consommation totale d'espaces sur la
                période sélectionnée.
              </p>
              <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
              <p className="fr-text--xs fr-mb-0">
                Les données proviennent des{" "}
                <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
              </p>
            </div>
          </GenericChart>
        </div>
      </div>
    </div>
  );
};
