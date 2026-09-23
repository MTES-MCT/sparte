import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import GenericChart from "@components/charts/GenericChart";
import BaseCard from "@components/ui/BaseCard";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

// Le sélecteur de millésime tient lieu de complément au titre : c'est lui qui
// dit de quelle année parlent les donuts, plutôt qu'un libellé figé à côté.
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};

  h2 {
    margin-bottom: 0;
  }
`;

export const ArtifRepartition: React.FC = () => {
  const {
    landId,
    landType,
    millesimes,
    millesimesByIndex,
    isInterdepartemental,
    selectedIndex,
    setSelectedIndex,
    byDepartementRepartition,
    setByDepartementRepartition,
  } = useArtificialisationContext();

  return (
    <div className="fr-mb-5w">
      <TitleRow>
        <h2>Surfaces artificialisées par type de couverture et d'usage</h2>
        <OcsgeMillesimeSelector
          millesimes_by_index={millesimesByIndex}
          index={selectedIndex}
          setIndex={setSelectedIndex}
          isDepartemental={isInterdepartemental}
        />
      </TitleRow>
      {isInterdepartemental && (
        <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
          <div className="fr-col-auto">
            <DepartmentSelector
              byDepartement={byDepartementRepartition}
              setByDepartement={setByDepartementRepartition}
            />
          </div>
        </div>
      )}
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
        {byDepartementRepartition ? (
          millesimes
            .filter((e) => e.index === selectedIndex)
            .map((m) => (
              <div key={`${m.index}_${m.departement}`} className="fr-col-12 fr-col-xl-6">
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
                  </GenericChart>
                </FlexColumn>
              </div>
            ))
        ) : (
          <>
            <div className="fr-col-12 fr-col-xl-6">
              <GenericChart
                id="pie_artif_by_couverture"
                land_id={landId}
                land_type={landType}
                params={{ index: selectedIndex }}
                sources={["ocsge"]}
                showDataTable={true}
              >
              </GenericChart>
            </div>
            <div className="fr-col-12 fr-col-xl-6">
              <GenericChart
                id="pie_artif_by_usage"
                land_id={landId}
                land_type={landType}
                params={{ index: selectedIndex }}
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
