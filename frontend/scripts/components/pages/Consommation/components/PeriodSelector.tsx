import React from "react";
import { formatNumber } from "@utils/formatUtils";

interface PeriodSelectorProps {
  startYear: number;
  endYear: number;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  defaultStartYear?: number;
  defaultEndYear?: number;
  // Sticky key cards data
  showStickyConsoCard?: boolean;
  showStickyPerHabitantCard?: boolean;
  showStickyPopulationCard?: boolean;
  totalConsoHa?: number | null;
  consoPerNewHabitant?: string;
  populationEvolution?: number | null;
  populationEvolutionPercent?: number | null;
  isLoadingConso?: boolean;
  isLoadingPop?: boolean;
  // Child land type selector
  childLandTypes?: string[];
  childType?: string;
  onChildTypeChange?: (childType: string) => void;
  landTypeLabels?: Record<string, string>;
}

/**
 * Sticky period selector component for the Consommation page
 * Allows users to select start and end years for analysis
 */
export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
  minYear = 2009,
  maxYear = 2023,
  defaultStartYear = 2011,
  defaultEndYear = 2023,
  showStickyConsoCard = false,
  showStickyPerHabitantCard = false,
  showStickyPopulationCard = false,
  totalConsoHa = null,
  consoPerNewHabitant = "...",
  populationEvolution = null,
  populationEvolutionPercent = null,
  isLoadingConso = false,
  isLoadingPop = false,
  childLandTypes,
  childType,
  onChildTypeChange,
  landTypeLabels = {},
}) => {
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const hasChangedFromDefault = startYear !== defaultStartYear || endYear !== defaultEndYear;

  const handleReset = () => {
    onStartYearChange(defaultStartYear);
    onEndYearChange(defaultEndYear);
  };

  const formatPopulationEvolution = () => {
    if (isLoadingPop || populationEvolution === null) {
      return "...";
    }

    const sign = populationEvolution > 0 ? "+" : "";
    return `${sign}${formatNumber({ number: populationEvolution })} hab`;
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "160px",
        zIndex: 100,
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="fr-card fr-card--no-border fr-card--shadow" style={{ background: "transparent" }}>
        <div className="fr-card__body" style={{ padding: "0.75rem 1rem" }}>
            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle" style={{ minHeight: "6rem" }}>
              {/* Title section */}
              <div className="fr-col-auto">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <div
                      className="fr-icon-calendar-line"
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--text-label-blue-france)",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="fr-col-auto">
                    <span className="fr-text--sm fr-mb-0" style={{ fontWeight: 600 }}>
                      Période d'analyse
                    </span>
                  </div>
                </div>
              </div>

              {/* Year selectors */}
              <div className={showStickyConsoCard || showStickyPerHabitantCard || showStickyPopulationCard ? "fr-col-auto" : "fr-col"}>
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <select
                      className="fr-select fr-select--sm"
                      id="start-year"
                      value={startYear}
                      onChange={(e) => onStartYearChange(Number(e.target.value))}
                      aria-label="Année de début"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year} disabled={year >= endYear}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fr-col-auto" style={{ padding: "0" }}>
                    <span className="fr-text--sm">-</span>
                  </div>

                  <div className="fr-col-auto">
                    <select
                      className="fr-select fr-select--sm"
                      id="end-year"
                      value={endYear}
                      onChange={(e) => onEndYearChange(Number(e.target.value))}
                      aria-label="Année de fin"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year} disabled={year <= startYear}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasChangedFromDefault && (
                    <div className="fr-col-auto">
                      <button
                        onClick={handleReset}
                        className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-refresh-line"
                        title={`Réinitialiser à la période ${defaultStartYear}-${defaultEndYear}`}
                      >
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Child land type selector */}
              {childLandTypes && childLandTypes.length > 1 && onChildTypeChange && (
                <div className="fr-col-auto">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {childLandTypes.map((type) => (
                      <button
                        key={type}
                        className={`fr-btn ${
                          childType === type
                            ? "fr-btn--primary"
                            : "fr-btn--tertiary"
                        } fr-btn--sm`}
                        style={{ padding: "0.25rem 0.75rem" }}
                        onClick={() => onChildTypeChange(type)}
                      >
                        {landTypeLabels[type] || type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky key data cards */}
              {(showStickyConsoCard || showStickyPerHabitantCard || showStickyPopulationCard) && (
                <div className="fr-col">
                  <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle" style={{ justifyContent: "flex-end" }}>
                    {/* Consommation d'espaces */}
                    {showStickyConsoCard && (
                      <div className="fr-col-auto">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "2px solid var(--artwork-major-blue-france)",
                          }}
                        >
                          <i className="bi-graph-up" style={{ fontSize: "1.5rem", color: "var(--artwork-major-blue-france)" }}></i>
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-mention-grey)" }}>
                              Consommation d'espaces
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--artwork-major-blue-france)" }}>
                              {isLoadingConso || totalConsoHa === null
                                ? "..."
                                : `${formatNumber({ number: totalConsoHa, addSymbol: true })} ha`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Consommation par nouvel habitant */}
                    {showStickyPerHabitantCard && (
                      <div className="fr-col-auto">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "2px solid var(--artwork-major-blue-france)",
                          }}
                        >
                          <i className="bi-house" style={{ fontSize: "1.5rem", color: "var(--artwork-major-blue-france)" }}></i>
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-mention-grey)" }}>
                              Consommation par nouvel habitant
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--artwork-major-blue-france)" }}>
                              {consoPerNewHabitant}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Évolution de la population */}
                    {showStickyPopulationCard && (
                      <div className="fr-col-auto">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "2px solid var(--artwork-major-blue-france)",
                          }}
                        >
                          <i className="bi-people" style={{ fontSize: "1.5rem", color: "var(--artwork-major-blue-france)" }}></i>
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-mention-grey)" }}>
                              Évolution de la population
                            </div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--artwork-major-blue-france)" }}>
                              {formatPopulationEvolution()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
