import React from "react";
import Card from "@components/ui/Card";
import GenericChart from "@components/charts/GenericChart";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import { ConsommationControls } from "./components/ConsommationControls";
import { ConsoDemography } from "./components/ConsoDemography";
import { ConsoComparison } from "./components/ConsoComparison";
import { useConsoData, useNearestTerritories, useComparisonTerritories } from "./hooks";
import { ConsommationControlsProvider, useConsommationControls } from "./context/ConsommationControlsContext";
import { TopBarContent } from "@components/layout/TopBarContent";

interface ConsommationProps {
  landData: LandDetailResultType;
}

const DetailsCalculationFichiersFonciers: React.FC = () => (
  <div>
    <h6 className="fr-mb-0">Calcul</h6>
    <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
  </div>
);

const ConsommationContent: React.FC<ConsommationProps> = ({ landData }) => {
  const { land_id, land_type, name, child_land_types } = landData || {};

  const {
    startYear,
    endYear,
    childType,
    setChildType,
    consoCardRef,
    perHabitantCardRef,
    populationCardRef,
    landTypeLabels: LAND_TYPE_LABELS,
    totalConsoHa,
    populationEvolution,
    populationEvolutionPercent,
    isLoadingConso,
    isLoadingPop,
  } = useConsommationControls();

  const { populationDensity, populationStock } = useConsoData(land_id, land_type, startYear, endYear);

  const { territories: suggestedTerritories } = useNearestTerritories(land_id, land_type);

  const {
    effectiveComparisonTerritories,
    comparisonLandIds,
    isDefaultSelection,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  } = useComparisonTerritories(land_id, land_type, suggestedTerritories);

  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <>
      {/* Enregistre les contrôles dans la TopBar de manière déclarative */}
      <TopBarContent>
        <ConsommationControls />
      </TopBarContent>

      <div className="fr-container--fluid fr-p-3w">
        <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
          <div className="fr-col-12 fr-col-md-3" ref={consoCardRef}>
            <Card
              icon="bi-graph-up"
              badgeClass="fr-badge--error"
              badgeLabel="Consommation d'espaces"
              value={
                isLoadingConso || totalConsoHa === null ? "..." : `${formatNumber({ number: totalConsoHa, addSymbol: true })} ha`
              }
              label={`Entre ${startYear} et ${endYear}`}
              isHighlighted={true}
              highlightBadge="Donnée clé"
            />
          </div>
          <div className="fr-col-12 fr-col-md-9">
            <div className="bg-white fr-p-4w rounded h-100">
              <h6>Qu'est-ce que la consommation d'espaces ?</h6>
              <p className="fr-text--sm">
                La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme <strong>« la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »</strong> (article 194 de la loi Climat et résilience).
              </p>
              <p className="fr-text--sm">
                Cet article exprime le fait que le caractère urbanisé d'un espace est la traduction de l'usage qui en est fait. Un espace urbanisé n'est plus un espace d'usage NAF (Naturel, Agricole et Forestier). Si l'artificialisation des sols traduit globalement un changement de couverture physique, la consommation traduit un changement d'usage. A titre d'exemple, un bâtiment agricole artificialise mais ne consomme pas.
              </p>
            </div>
          </div>
        </div>

      <div>
        <h3 id="conso-annuelle">Évolution annuelle de la consommation d'espaces NAF</h3>

        <div className="fr-mb-5w">
          <div className="bg-white fr-p-2w rounded">
            <GenericChart
              id="annual_total_conso_chart"
              land_id={land_id}
              land_type={land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
                ...(childType && { child_type: childType }),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <DetailsCalculationFichiersFonciers />
            </GenericChart>
          </div>
        </div>

        <h3 id="conso-determinants">Répartition de la consommation d'espaces NAF par type de destination</h3>

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-6">
            <div className="bg-white fr-p-2w rounded h-100">
              <GenericChart
                id="pie_determinant"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                }}
                sources={["majic"]}
                showDataTable={true}
              >
                <div>
                  <h6 className="fr-mb-0">Source</h6>
                  <p className="fr-text--sm fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                  <p className="fr-text--sm fr-mb-0">
                    La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les
                    fichiers fonciers.
                  </p>
                  <h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
                  <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
                </div>
              </GenericChart>
            </div>
          </div>
          <div className="fr-col-12 fr-col-lg-6">
            <div className="bg-white fr-p-2w rounded h-100">
              <GenericChart
                id="chart_determinant"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                }}
                sources={["majic"]}
                showDataTable={true}
              >
                <div>
                  <h6 className="fr-mb-0">Source</h6>
                  <p className="fr-text--sm fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                  <p className="fr-text--sm fr-mb-0">
                    La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les
                    fichiers fonciers.
                  </p>
                  <h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
                  <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
                </div>
              </GenericChart>
            </div>
          </div>
        </div>
      </div>

      {child_land_types && child_land_types.length > 0 && (
        <div className="fr-mb-7w fr-mt-5w">
          <h3 id="conso-map">Cartes de consommation d'espaces</h3>

          {child_land_types.length > 1 && (
            <div className="fr-mb-3w">
              {child_land_types.map((child_land_type) => (
                <button
                  key={child_land_type}
                  className={`fr-btn ${
                    childType === child_land_type
                      ? "fr-btn--primary"
                      : "fr-btn--tertiary"
                  } fr-btn--sm fr-mr-1w`}
                  onClick={() => setChildType(child_land_type)}
                >
                  {LAND_TYPE_LABELS[child_land_type] || child_land_type}
                </button>
              ))}
            </div>
          )}

          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-6">
              <div className="bg-white fr-p-2w rounded h-100">
                <GenericChart
                  id="conso_map_relative"
                  land_id={land_id}
                  land_type={land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: childType,
                  }}
                  sources={["majic"]}
                  showDataTable={true}
                  isMap={true}
                >
                  <div>
                    <h6 className="fr-mb-0">Comprendre la carte</h6>
                    <p className="fr-text--sm fr-mb-0">
                      Cette carte permet de visualiser la consommation d'espaces NAF relative à la surface de chaque territoire, représentée par l'intensité de la couleur : plus la teinte est foncée, plus la consommation d'espaces est importante par rapport à la surface du territoire.
                    </p>
                    <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
                    <p className="fr-text--sm fr-mb-0">
                      Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                    </p>
                  </div>
                </GenericChart>
              </div>
            </div>

            <div className="fr-col-12 fr-col-lg-6">
              <div className="bg-white fr-p-2w rounded h-100">
                <GenericChart
                  id="conso_map_bubble"
                  land_id={land_id}
                  land_type={land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: childType,
                  }}
                  sources={["majic"]}
                  showDataTable={true}
                  isMap={true}
                >
                  <div>
                    <h6 className="fr-mb-0">Comprendre la carte</h6>
                    <p className="fr-text--sm fr-mb-0">
                      Cette carte permet de visualiser les flux de consommation d'espaces NAF par territoire : la taille des cercles est proportionnelle à la consommation totale d'espaces sur la période sélectionnée.
                    </p>
                    <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
                    <p className="fr-text--sm fr-mb-0">
                      Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                    </p>
                  </div>
                </GenericChart>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConsoDemography
        landId={land_id}
        landType={land_type}
        startYear={startYear}
        endYear={endYear}
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        populationDensity={populationDensity}
        populationStock={populationStock}
        isLoadingPop={isLoadingPop}
        populationCardRef={populationCardRef}
      />

      <ConsoComparison
          landId={land_id}
          landType={land_type}
          landName={name}
          startYear={startYear}
          endYear={endYear}
          territories={effectiveComparisonTerritories}
          comparisonLandIds={comparisonLandIds}
          isDefaultSelection={isDefaultSelection}
          onAddTerritory={handleAddTerritory}
          onRemoveTerritory={handleRemoveTerritory}
          onReset={handleResetTerritories}
        />
      </div>
    </>
  );
};

export const Consommation: React.FC<ConsommationProps> = ({ landData }) => {
  const { land_id, land_type, child_land_types } = landData || {};

  return (
    <ConsommationControlsProvider
      land_id={land_id}
      land_type={land_type}
      childLandTypes={child_land_types}
    >
      <ConsommationContent landData={landData} />
    </ConsommationControlsProvider>
  );
};
