import React from "react";
import Card from "@components/ui/Card";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import { PeriodSelector } from "./components/PeriodSelector";
import { ConsoDemography } from "./components/ConsoDemography";
import { ConsoComparison } from "./components/ConsoComparison";
import { useConsoData, useSimilarTerritories, useComparisonTerritories } from "./hooks";

interface ConsommationProps {
  landData: LandDetailResultType;
}

const DetailsCalculationFichiersFonciers: React.FC = () => (
  <div>
    <h6 className="fr-mb-0">Calcul</h6>
    <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
  </div>
);

// Default dates for analysis
const DEFAULT_START_YEAR = 2011;
const DEFAULT_END_YEAR = 2023;

// Land type labels mapping
const LAND_TYPE_LABELS: Record<string, string> = {
  COMM: "Commune",
  EPCI: "EPCI",
  DEPART: "Département",
  SCOT: "SCoT",
  REGION: "Région",
  NATION: "Nation",
  COMP: "Composite",
};

// Land type hierarchy (higher values = higher in hierarchy)
const LAND_TYPE_HIERARCHY: Record<string, number> = {
  REGION: 5,
  DEPART: 4,
  SCOT: 3,
  EPCI: 2,
  COMM: 1,
  NATION: 6,
  COMP: 0,
};

// Get the highest land type from an array
const getHighestLandType = (landTypes: string[]): string => {
  if (!landTypes || landTypes.length === 0) return "";
  return landTypes.reduce((highest, current) => {
    const highestValue = LAND_TYPE_HIERARCHY[highest] || 0;
    const currentValue = LAND_TYPE_HIERARCHY[current] || 0;
    return currentValue > highestValue ? current : highest;
  });
};

/**
 * Main Consommation page component
 * Displays consumption statistics, demographic data, and territory comparisons
 */
export const Consommation: React.FC<ConsommationProps> = ({ landData }) => {
  const { land_id, land_type, name, surface, child_land_types } = landData || {};

  // State for selected years
  const [startYear, setStartYear] = React.useState(DEFAULT_START_YEAR);
  const [endYear, setEndYear] = React.useState(DEFAULT_END_YEAR);

  // State for selected child type (if territory has multiple child types)
  // Default to the highest type in hierarchy (REGION > DEPART > SCOT > EPCI > COMM)
  const [childType, setChildType] = React.useState<string | undefined>(
    child_land_types && child_land_types.length > 0 ? getHighestLandType(child_land_types) : undefined
  );

  // State for sticky key data cards
  const [showStickyConsoCard, setShowStickyConsoCard] = React.useState(false);
  const [showStickyPerHabitantCard, setShowStickyPerHabitantCard] = React.useState(false);
  const consoCardRef = React.useRef<HTMLDivElement>(null);
  const perHabitantCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      // Check first card (Consommation d'espaces)
      if (consoCardRef.current) {
        const rect = consoCardRef.current.getBoundingClientRect();
        setShowStickyConsoCard(rect.bottom < 0);
      }

      // Check second card (Consommation par nouvel habitant)
      if (perHabitantCardRef.current) {
        const rect = perHabitantCardRef.current.getBoundingClientRect();
        setShowStickyPerHabitantCard(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate consumption per new habitant
  const calculateConsoPerNewHabitant = () => {
    if (isLoadingConso || isLoadingPop || totalConsoHa === null || populationEvolution === null || populationEvolution <= 0) {
      return "...";
    }

    // Convert ha to m² (1 ha = 10,000 m²)
    const consoPerHabitantM2 = (totalConsoHa * 10000) / populationEvolution;
    return `${formatNumber({ number: consoPerHabitantM2, decimals: 0 })} m²`;
  };

  // Fetch consumption and population data
  const { totalConsoHa, populationEvolution, populationEvolutionPercent, populationDensity, isLoadingConso, isLoadingPop } =
    useConsoData(land_id, land_type, startYear, endYear);

  // Fetch similar territories
  const { territories: suggestedTerritories } = useSimilarTerritories(land_id, land_type);

  // Manage comparison territories
  const {
    additionalTerritories,
    comparisonLandIds,
    isDefaultSelection,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  } = useComparisonTerritories(land_id, land_type);

  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <>
      {/* Period selector (sticky) */}
      <PeriodSelector
        startYear={startYear}
        endYear={endYear}
        onStartYearChange={setStartYear}
        onEndYearChange={setEndYear}
        defaultStartYear={DEFAULT_START_YEAR}
        defaultEndYear={DEFAULT_END_YEAR}
        showStickyConsoCard={showStickyConsoCard}
        showStickyPerHabitantCard={showStickyPerHabitantCard}
        totalConsoHa={totalConsoHa}
        consoPerNewHabitant={calculateConsoPerNewHabitant()}
        isLoadingConso={isLoadingConso}
        isLoadingPop={isLoadingPop}
      />

      <div className="fr-container--fluid fr-p-3w">
        {/* Main statistics cards */}
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

      {/* Annual consumption section */}
      <div>
        <h3 id="conso-annuelle">Évolution de la consommation d'espaces</h3>

        <div className="fr-mb-5w">
          <div className="bg-white fr-p-2w rounded">
            <ConsoGraph
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
              dataTableHeader={
                child_land_types && child_land_types.length > 1 ? (
                  <div
                    className="fr-mb-2w fr-p-2w"
                    style={{
                      backgroundColor: "#f6f6f6",
                      borderRadius: "4px",
                      border: "1px solid #e5e5e5"
                    }}
                  >
                    <div className="fr-grid-row fr-grid-row--middle" style={{ gap: "0.75rem" }}>
                      <div className="fr-col-auto">
                        <span className="fr-icon-table-line" style={{ fontSize: "1.25rem", color: "var(--text-label-blue-france)" }} aria-hidden="true" />
                      </div>
                      <div className="fr-col-auto">
                        <span className="fr-text--xs fr-text--bold">
                          Tableau par :
                        </span>
                      </div>
                      <div className="fr-col" role="tablist" aria-label="Sélection du type de territoire">
                        {child_land_types.map((child_land_type) => (
                          <button
                            key={child_land_type}
                            className={`fr-btn ${
                              childType === child_land_type
                                ? "fr-btn--secondary"
                                : "fr-btn--tertiary-no-outline"
                            } fr-btn--sm fr-mr-1w`}
                            onClick={() => setChildType(child_land_type)}
                            aria-pressed={childType === child_land_type}
                          >
                            {LAND_TYPE_LABELS[child_land_type] || child_land_type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : undefined
              }
            >
              <DetailsCalculationFichiersFonciers />
            </ConsoGraph>
          </div>
        </div>

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-6">
            <div className="bg-white fr-p-2w rounded h-100">
              <ConsoGraph
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
              </ConsoGraph>
            </div>
          </div>
          <div className="fr-col-12 fr-col-lg-6">
            <div className="bg-white fr-p-2w rounded h-100">
              <ConsoGraph
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
              </ConsoGraph>
            </div>
          </div>
        </div>
      </div>

      {/* Demography section */}
      <ConsoDemography
        landId={land_id}
        landType={land_type}
        startYear={startYear}
        endYear={endYear}
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        isLoadingPop={isLoadingPop}
        defaultStartYear={DEFAULT_START_YEAR}
        defaultEndYear={DEFAULT_END_YEAR}
      />

        {/* Comparison section */}
        <ConsoComparison
          landId={land_id}
          landType={land_type}
          landName={name}
          startYear={startYear}
          endYear={endYear}
          suggestedTerritories={suggestedTerritories}
          additionalTerritories={additionalTerritories}
          comparisonLandIds={comparisonLandIds}
          isDefaultSelection={isDefaultSelection}
          onTerritoryAdd={handleAddTerritory}
          onTerritoryRemove={handleRemoveTerritory}
          onReset={handleResetTerritories}
        />
      </div>
    </>
  );
};
