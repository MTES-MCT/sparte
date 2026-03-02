import React, { useState, useCallback } from "react";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import GenericChart from "@components/charts/GenericChart";
import Button from "@components/ui/Button";
import GuideContent from "@components/ui/GuideContent";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { getLandTypeLabel } from "@utils/landUtils";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

const CHILD_LAND_TYPE_MAP: Record<string, string> = {
  REGION: "DEPART",
  DEPART: "EPCI",
  SCOT: "COMM",
  EPCI: "COMM",
};

export const ArtifChildLands: React.FC = () => {
  const {
    landId,
    landType,
    name,
    childLandTypes,
    childLandType,
    setChildLandType,
    defaultStockIndex,
  } = useArtificialisationContext();

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
  const mapLandId = currentMapLand?.land_id ?? landId;
  const mapLandType = currentMapLand?.land_type ?? landType;
  const mapChildLandType = currentMapLand?.child_land_type ?? childLandType;

  if (!childLandTypes || childLandTypes.length === 0) {
    return null;
  }

  return (
    <div className="fr-mb-5w">
      <h2>Artificialisation des {getLandTypeLabel(childLandType, true)}</h2>
      {childLandTypes.length > 1 && (
        <div className="fr-mb-2w d-flex align-items-center gap-2">
          {childLandTypes.map((child_land_type) => (
            <Button
              key={child_land_type}
              variant={childLandType === child_land_type ? "primary" : "outline"}
              size="small"
              onClick={() => handleChildLandTypeChange(child_land_type)}
            >
              {getLandTypeLabel(child_land_type)}
            </Button>
          ))}
        </div>
      )}
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
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
              key={`artif_map_${mapLandType}_${mapLandId}_${mapChildLandType}`}
              isMap
              id="artif_map"
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
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <GuideContent title="Comprendre les données">
            <p>
              La couleur de fond indique le <strong>taux d'artificialisation</strong> de chaque
              territoire : plus la teinte <strong style={{ color: "#6a6af4" }}>violette</strong> est
              intense, plus la part artificialisée est élevée.
            </p>
            <p>
              Les cercles représentent l'<strong>évolution</strong> entre les deux millésimes :{" "}
              <strong style={{ color: "#FC9292" }}>rouge</strong> pour une artificialisation nette,{" "}
              <strong style={{ color: "#7ec974" }}>vert</strong> pour une désartificialisation nette.
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
