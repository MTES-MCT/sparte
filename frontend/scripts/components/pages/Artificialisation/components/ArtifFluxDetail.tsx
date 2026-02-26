import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import GenericChart from "@components/charts/GenericChart";
import BaseCard from "@components/ui/BaseCard";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const ArtifFluxDetail: React.FC = () => {
  const {
    landId,
    landType,
    millesimes,
    isInterdepartemental,
    byDepartementFlux,
    setByDepartementFlux,
  } = useArtificialisationContext();

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
              <div key={`${m.index}_${m.departement}`} className="fr-col-12">
                <FlexColumn>
                  <GenericChart
                    id="artif_flux_by_couverture"
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
                  </GenericChart>
                  <GenericChart
                    id="artif_flux_by_usage"
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
                  </GenericChart>
                </FlexColumn>
              </div>
            ))
        ) : (
          <>
            <div className="fr-col-12">
              <GenericChart
                id="artif_flux_by_couverture"
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
              </GenericChart>
            </div>
            <div className="fr-col-12">
              <GenericChart
                id="artif_flux_by_usage"
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
              </GenericChart>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
