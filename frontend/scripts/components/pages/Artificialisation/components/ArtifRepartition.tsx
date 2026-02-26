import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import GenericChart from "@components/charts/GenericChart";
import BaseCard from "@components/ui/BaseCard";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const ArtifRepartition: React.FC = () => {
  const {
    landId,
    landType,
    millesimes,
    millesimesByIndex,
    isInterdepartemental,
    landArtifStockIndex,
    selectedIndex,
    setSelectedIndex,
    byDepartementRepartition,
    setByDepartementRepartition,
  } = useArtificialisationContext();

  return (
    <>
      <h2 className="fr-mt-4w">
        Artificialisation par type de couverture et d'usage{" "}
        <MillesimeDisplay
          is_interdepartemental={isInterdepartemental}
          landArtifStockIndex={landArtifStockIndex}
          between={true}
        />
      </h2>
      <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
        <div className="fr-col-auto">
          <OcsgeMillesimeSelector
            millesimes_by_index={millesimesByIndex}
            index={selectedIndex}
            setIndex={setSelectedIndex}
            isDepartemental={isInterdepartemental}
          />
        </div>
        {isInterdepartemental && (
          <div className="fr-col-auto">
            <DepartmentSelector
              byDepartement={byDepartementRepartition}
              setByDepartement={setByDepartementRepartition}
            />
          </div>
        )}
      </div>
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
        {byDepartementRepartition ? (
          millesimes
            .filter((e) => e.index === selectedIndex)
            .map((m) => (
              <div key={`${m.index}_${m.departement}`} className="fr-col-12 fr-col-lg-6">
                <FlexColumn>
                  <GenericChart
                    id="pie_artif_by_couverture"
                    land_id={landId}
                    land_type={landType}
                    params={{
                      index: m.index,
                      departement: m.departement,
                    }}
                    sources={["ocsge"]}
                    showDataTable={true}
                  >
                    <DetailsCalculationOcsge />
                  </GenericChart>
                  <GenericChart
                    id="pie_artif_by_usage"
                    land_id={landId}
                    land_type={landType}
                    params={{
                      index: m.index,
                      departement: m.departement,
                    }}
                    sources={["ocsge"]}
                    showDataTable={true}
                  >
                    <DetailsCalculationOcsge />
                  </GenericChart>
                </FlexColumn>
              </div>
            ))
        ) : (
          <>
            <div className="fr-col-12 fr-col-lg-6">
              <GenericChart
                id="pie_artif_by_couverture"
                land_id={landId}
                land_type={landType}
                params={{ index: selectedIndex }}
                sources={["ocsge"]}
                showDataTable={true}
              >
                <DetailsCalculationOcsge />
              </GenericChart>
            </div>
            <div className="fr-col-12 fr-col-lg-6">
              <GenericChart
                id="pie_artif_by_usage"
                land_id={landId}
                land_type={landType}
                params={{ index: selectedIndex }}
                sources={["ocsge"]}
                showDataTable={true}
              >
                <DetailsCalculationOcsge />
              </GenericChart>
            </div>
          </>
        )}
      </div>
    </>
  );
};
