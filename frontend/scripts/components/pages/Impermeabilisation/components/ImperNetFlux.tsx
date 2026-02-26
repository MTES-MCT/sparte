import React from "react";
import GenericChart from "@components/charts/GenericChart";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ImpermeabilisationDiffMap } from "@components/map/ui/ImpermeabilisationDiffMap";
import { LandType } from "@services/types/land";
import BaseCard from "@components/ui/BaseCard";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperNetFlux: React.FC = () => {
  const {
    landData,
    land_id,
    land_type,
    millesimes,
    isInterdepartemental,
    landImperStockIndex,
    byDepartementNetFlux,
    setByDepartementNetFlux,
  } = useImpermeabilisationContext();

  const maxIndex = Math.max(...millesimes.map((m) => m.index));

  return (
    <div className="fr-mb-7w">
      <h2 className="fr-mt-7w">
        Imperméabilisation nette des sols{" "}
        <MillesimeDisplay
          is_interdepartemental={isInterdepartemental}
          landArtifStockIndex={landImperStockIndex}
          between={true}
        />
      </h2>
      {land_type !== LandType.REGION && (
        <ImpermeabilisationDiffMap landData={landData} />
      )}
      <BaseCard className="fr-mt-4w">
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
                  <GenericChart
                    id="imper_net_flux"
                    land_id={land_id}
                    land_type={land_type}
                    params={{
                      millesime_new_index: maxIndex,
                      millesime_old_index: maxIndex - 1,
                      departement: m.departement,
                    }}
                    sources={["ocsge"]}
                    showDataTable={true}
                  >
                    <DetailsCalculationOcsge />
                  </GenericChart>
                </div>
              ))
          ) : (
            <div className="fr-col-12">
              <GenericChart
                id="imper_net_flux"
                land_id={land_id}
                land_type={land_type}
                params={{
                  millesime_new_index: maxIndex,
                  millesime_old_index: maxIndex - 1,
                }}
                sources={["ocsge"]}
                showDataTable={true}
              >
                <DetailsCalculationOcsge />
              </GenericChart>
            </div>
          )}
        </div>
      </BaseCard>
    </div>
  );
};
