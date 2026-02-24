import React from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { LandType } from "@services/types/land";
import BaseCard from "@components/ui/BaseCard";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { ArtificialisationDiffMap } from "@components/map/ui/ArtificialisationDiffMap";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

export const ArtifNetFlux: React.FC = () => {
  const {
    landData,
    landId,
    landType,
    millesimes,
    isInterdepartemental,
    landArtifStockIndex,
    byDepartementNetFlux,
    setByDepartementNetFlux,
  } = useArtificialisationContext();

  const maxIndex = Math.max(...millesimes.map((m) => m.index));

  return (
    <div className="fr-mb-7w">
      <h2 className="fr-mt-7w">
        Artificialisation nette des sols{" "}
        <MillesimeDisplay
          is_interdepartemental={isInterdepartemental}
          landArtifStockIndex={landArtifStockIndex}
          between={true}
        />
      </h2>
      {landType !== LandType.REGION && (
        <ArtificialisationDiffMap landData={landData} />
      )}
      {isInterdepartemental && (
        <DepartmentSelector
          byDepartement={byDepartementNetFlux}
          setByDepartement={setByDepartementNetFlux}
        />
      )}
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
        {byDepartementNetFlux ? (
          millesimes
            .filter((e) => e.index === maxIndex)
            .map((m) => (
              <div key={`${m.index}_${m.departement}`} className="fr-col-12">
                <OcsgeGraph
                  id="artif_net_flux"
                  land_id={landId}
                  land_type={landType}
                  params={{
                    millesime_new_index: maxIndex,
                    millesime_old_index: maxIndex - 1,
                    departement: m.departement,
                  }}
                  sources={["ocsge"]}
                  showDataTable={true}
                >
                  <DetailsCalculationOcsge />
                </OcsgeGraph>
              </div>
            ))
        ) : (
          <div className="fr-col-12">
            <OcsgeGraph
              id="artif_net_flux"
              land_id={landId}
              land_type={landType}
              params={{
                millesime_new_index: maxIndex,
                millesime_old_index: maxIndex - 1,
              }}
              sources={["ocsge"]}
              showDataTable={true}
            >
              <DetailsCalculationOcsge />
            </OcsgeGraph>
          </div>
        )}
      </div>
    </div>
  );
};
