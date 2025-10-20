import React from "react";

interface PeriodSelectorProps {
  startYear: number;
  endYear: number;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  defaultStartYear?: number;
  defaultEndYear?: number;
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
}) => {
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const hasChangedFromDefault = startYear !== defaultStartYear || endYear !== defaultEndYear;

  const handleReset = () => {
    onStartYearChange(defaultStartYear);
    onEndYearChange(defaultEndYear);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "88px",
        zIndex: 100,
        backgroundColor: "#f8f9ff",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        marginBottom: "1rem",
        marginTop: "-1rem",
      }}
    >
      <div className="fr-container--fluid" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <div className="fr-card fr-card--no-border fr-card--shadow">
          <div className="fr-card__body" style={{ padding: "0.75rem 1rem" }}>
            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
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
              <div className="fr-col">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <span className="fr-text--sm">De</span>
                  </div>
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

                  <div className="fr-col-auto">
                    <span className="fr-text--sm">à</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
