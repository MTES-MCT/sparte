import React from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import BaseCard from "@components/ui/BaseCard";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperFluxDetail: React.FC = () => {
  const {
    land_id,
    land_type,
    millesimes,
    isInterdepartemental,
    byDepartementFlux,
    setByDepartementFlux,
  } = useImpermeabilisationContext();

  const maxIndex = Math.max(...millesimes.map((m) => m.index));

  return (
    <div className="fr-mb-7w">
      {isInterdepartemental && (
        <DepartmentSelector
          byDepartement={byDepartementFlux}
          setByDepartement={setByDepartementFlux}
        />
      )}
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
        {byDepartementFlux ? (
          millesimes
            .filter((e) => e.index === maxIndex)
            .map((m) => (
              <div
                key={`${m.index}_${m.departement}`}
                className="fr-col-12 gap-4 d-flex flex-column"
              >
                <OcsgeGraph
                  id="imper_flux_by_couverture"
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
                </OcsgeGraph>
                <OcsgeGraph
                  id="imper_flux_by_usage"
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
                </OcsgeGraph>
              </div>
            ))
        ) : (
          <>
            <div className="fr-col-12">
              <OcsgeGraph
                id="imper_flux_by_couverture"
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
              </OcsgeGraph>
            </div>
            <div className="fr-col-12">
              <OcsgeGraph
                id="imper_flux_by_usage"
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
              </OcsgeGraph>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
