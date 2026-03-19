import React from "react";
import GenericChart from "@components/charts/GenericChart";
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
    <div className="fr-mb-5w">
      <h2>
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
                className="fr-col-12 fr-col-xl-6 gap-4 d-flex flex-column"
              >
                <GenericChart
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
                </GenericChart>
                <GenericChart
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
                </GenericChart>
              </div>
            ))
        ) : (
          <>
            <div className="fr-col-12 fr-col-xl-6">
              <GenericChart
                id="pie_imper_by_couverture"
                land_id={land_id}
                land_type={land_type}
                params={{
                  index: selectedIndex,
                }}
                sources={["ocsge"]}
                showDataTable={true}
              >
              </GenericChart>
            </div>
            <div className="fr-col-12 fr-col-xl-6">
              <GenericChart
                id="pie_imper_by_usage"
                land_id={land_id}
                land_type={land_type}
                params={{
                  index: selectedIndex,
                }}
                sources={["ocsge"]}
                showDataTable={true}
              >
              </GenericChart>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
