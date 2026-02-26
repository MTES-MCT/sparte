import React, { useState, useCallback } from "react";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import GenericChart from "@components/charts/GenericChart";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import GuideContent from "@components/ui/GuideContent";
import { getLandTypeLabel } from "@utils/landUtils";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

const CHILD_LAND_TYPE_MAP: Record<string, string> = {
  REGION: "DEPART",
  DEPART: "EPCI",
  SCOT: "COMM",
  EPCI: "COMM",
};

export const ImperChildLands: React.FC = () => {
  const {
    land_id,
    land_type,
    name,
    childLandTypes,
    childLandType,
    setChildLandType,
    defaultStockIndex,
  } = useImpermeabilisationContext();

  const [mapNavStack, setMapNavStack] = useState<
    { land_id: string; land_type: string; name: string; child_land_type: string }[]
  >([]);

  const handleMapPointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      const nextChildType = CHILD_LAND_TYPE_MAP[point.land_type];
      if (!nextChildType) return;
      setMapNavStack((prev) => [
        ...prev,
        {
          land_id: point.land_id,
          land_type: point.land_type,
          name: point.name,
          child_land_type: nextChildType,
        },
      ]);
    },
    []
  );

  const handleMapBreadcrumbClick = useCallback((index: number) => {
    setMapNavStack((prev) => prev.slice(0, index));
  }, []);

  const handleChildLandTypeChange = useCallback(
    (newType: string) => {
      setChildLandType(newType);
      setMapNavStack([]);
    },
    [setChildLandType]
  );

  const currentMapLand = mapNavStack.length > 0 ? mapNavStack[mapNavStack.length - 1] : null;
  const mapLandId = currentMapLand?.land_id ?? land_id;
  const mapLandType = currentMapLand?.land_type ?? land_type;
  const mapChildLandType = currentMapLand?.child_land_type ?? childLandType;

  if (!childLandTypes.length) return null;

  return (
    <div className="fr-mb-7w">
      <h2>
        Imperméabilisation des {getLandTypeLabel(childLandType, true)} du territoire
      </h2>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8">
          <div className="bg-white fr-p-2w h-100 rounded">
            <div className="fr-mb-2w d-flex align-items-center gap-2">
              {childLandTypes.length > 1 &&
                childLandTypes.map((child_land_type) => (
                  <button
                    key={child_land_type}
                    className={`fr-btn ${
                      childLandType === child_land_type ? "fr-btn--primary" : "fr-btn--tertiary"
                    } fr-btn--sm`}
                    onClick={() => handleChildLandTypeChange(child_land_type)}
                  >
                    {getLandTypeLabel(child_land_type)}
                  </button>
                ))}
            </div>
            {mapNavStack.length > 0 && (
              <Breadcrumb
                className="fr-mb-1w"
                segments={[
                  {
                    label: name,
                    linkProps: {
                      href: "#",
                      onClick: (e: React.MouseEvent) => {
                        e.preventDefault();
                        handleMapBreadcrumbClick(0);
                      },
                    },
                  },
                  ...mapNavStack.slice(0, -1).map((entry, i) => ({
                    label: entry.name,
                    linkProps: {
                      href: "#",
                      onClick: (e: React.MouseEvent) => {
                        e.preventDefault();
                        handleMapBreadcrumbClick(i + 1);
                      },
                    },
                  })),
                ]}
                currentPageLabel={mapNavStack[mapNavStack.length - 1].name}
              />
            )}
            <GenericChart
              key={`imper_map_${mapLandType}_${mapLandId}_${mapChildLandType}`}
              isMap
              id="imper_map"
              land_id={mapLandId}
              land_type={mapLandType}
              containerProps={{
                style: {
                  height: "500px",
                  width: "100%",
                },
              }}
              params={{
                index: defaultStockIndex,
                previous_index: defaultStockIndex - 1,
                child_land_type: mapChildLandType,
              }}
              sources={["ocsge"]}
              showDataTable={true}
              onPointClick={CHILD_LAND_TYPE_MAP[mapChildLandType] ? handleMapPointClick : undefined}
            >
              <DetailsCalculationOcsge />
            </GenericChart>
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <GuideContent title="Comprendre les données" column>
            <p>
              La couleur de fond indique le <strong>taux d'imperméabilisation</strong> de chaque
              territoire : plus la teinte <strong style={{ color: "#6a6af4" }}>violette</strong> est
              intense, plus la part imperméabilisée est élevée.
            </p>
            <p>
              Les cercles représentent l'<strong>évolution</strong> entre les deux millésimes :{" "}
              <strong style={{ color: "#FC9292" }}>rouge</strong> pour une imperméabilisation nette,{" "}
              <strong style={{ color: "#7ec974" }}>vert</strong> pour une désimperméabilisation nette.
              Leur taille est proportionnelle à la surface concernée.
            </p>
            <p>
              Cliquez sur un territoire pour afficher le détail de ses sous-territoires. Le fil
              d'Ariane en haut de la carte permet de revenir au niveau précédent.
            </p>
          </GuideContent>
        </div>
      </div>
    </div>
  );
};
