import React from "react";
import Kpi from "@components/ui/Kpi";
import GenericChart from "@components/charts/GenericChart";
import Loader from "@components/ui/Loader";
import { formatNumber } from "@utils/formatUtils";
import { useConsommationControls } from "../context/ConsommationControlsContext";

interface ConsoAnnuelleProps {
  landId: string;
  landType: string;
}

export const ConsoAnnuelle: React.FC<ConsoAnnuelleProps> = ({
  landId,
  landType,
}) => {
  const {
    startYear,
    endYear,
    childType,
    consoCardRef,
    totalConsoHa,
    isLoadingConso,
  } = useConsommationControls();

  return (
    <div>
      <h3 id="conso-annuelle">Évolution annuelle de la consommation d'espaces NAF</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row" ref={consoCardRef}>
          <Kpi
            icon="bi-bar-chart"
            label="Consommation d'espaces"
            value={
              isLoadingConso || totalConsoHa === null ? (
                <Loader size={32} />
              ) : (
                <>
                  {formatNumber({ number: totalConsoHa, addSymbol: true })}{" "}
                  <span>ha</span>
                </>
              )
            }
            variant="default"
            badge="Donnée clé"
            footer={{
              type: "period",
              periods: [
                { label: String(startYear), active: true },
                { label: String(endYear) },
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
          <GenericChart
            id="annual_total_conso_chart"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
              ...(childType && { child_type: childType }),
            }}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            </div>
          </GenericChart>
        </div>
      </div>

      <h3 id="conso-determinants">
        Répartition de la consommation d'espaces NAF par destination
      </h3>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            id="pie_determinant"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            </div>
          </GenericChart>
        </div>
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            id="chart_determinant"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            </div>
          </GenericChart>
        </div>
      </div>
    </div>
  );
};
