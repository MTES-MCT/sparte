import React from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import BaseCard from "@components/ui/BaseCard";
import { useImpermeabilisationContext } from "../context/ImpermeabilisationContext";

export const ImperRepartition: React.FC = () => {
  const {
    land_id,
    land_type,
    millesimes,
    millesimesByIndex,
    isInterdepartemental,
    selectedIndex,
    setSelectedIndex,
    landImperStockIndex,
    byDepartementRepartition,
    setByDepartementRepartition,
  } = useImpermeabilisationContext();

  return (
    <>
      <h2 className="fr-mt-4w">
        Imperméabilisation par type de couverture et d'usage{" "}
        <MillesimeDisplay
          is_interdepartemental={isInterdepartemental}
          landArtifStockIndex={landImperStockIndex}
          between={true}
        />
      </h2>
      <div className="d-flex gap-4">
        <OcsgeMillesimeSelector
          millesimes_by_index={millesimesByIndex}
          index={selectedIndex}
          setIndex={setSelectedIndex}
          isDepartemental={isInterdepartemental}
        />
        {isInterdepartemental && (
          <DepartmentSelector
            byDepartement={byDepartementRepartition}
            setByDepartement={setByDepartementRepartition}
          />
        )}
      </div>
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
        {byDepartementRepartition ? (
          millesimes
            .filter((e) => e.index === selectedIndex)
            .map((m) => (
              <div
                key={`${m.index}_${m.departement}`}
                className="fr-col-12 fr-col-lg-6 gap-4 d-flex flex-column"
              >
                <OcsgeGraph
                  id="pie_imper_by_couverture"
                  land_id={land_id}
                  land_type={land_type}
                  params={{
                    index: m.index,
                    departement: m.departement,
                  }}
                  sources={["ocsge"]}
                  showDataTable={true}
                >
                  <DetailsCalculationOcsge />
                </OcsgeGraph>
                <OcsgeGraph
                  id="pie_imper_by_usage"
                  land_id={land_id}
                  land_type={land_type}
                  params={{
                    index: m.index,
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
            <div className="fr-col-12 fr-col-lg-6">
              <OcsgeGraph
                id="pie_imper_by_couverture"
                land_id={land_id}
                land_type={land_type}
                params={{
                  index: selectedIndex,
                }}
                sources={["ocsge"]}
                showDataTable={true}
              >
                <DetailsCalculationOcsge />
              </OcsgeGraph>
            </div>
            <div className="fr-col-12 fr-col-lg-6">
              <OcsgeGraph
                id="pie_imper_by_usage"
                land_id={land_id}
                land_type={land_type}
                params={{
                  index: selectedIndex,
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
    </>
  );
};
