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
        paddingTop: "1rem",
        paddingBottom: "1rem",
        marginBottom: "1.5rem",
        marginTop: "-1.5rem",
      }}
    >
      <div className="fr-container--fluid" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <div className="fr-card fr-card--no-border fr-card--shadow">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
              {/* Title section */}
              <div className="fr-col-12 fr-col-md-auto">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <div
                      className="fr-icon-calendar-line"
                      style={{
                        fontSize: "2rem",
                        color: "var(--text-label-blue-france)",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="fr-col">
                    <h6 className="fr-mb-0">Période d'analyse</h6>
                    <p className="fr-text--xs fr-mb-0 fr-text--regular">
                      Sélectionnez la période pour analyser la consommation
                    </p>
                  </div>
                </div>
              </div>

              {/* Year selectors */}
              <div className="fr-col-12 fr-col-md">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--bottom">
                  <div className="fr-col-auto">
                    <div className="fr-select-group">
                      <label className="fr-label" htmlFor="start-year">
                        Année de début
                      </label>
                      <select
                        className="fr-select"
                        id="start-year"
                        value={startYear}
                        onChange={(e) => onStartYearChange(Number(e.target.value))}
                      >
                        {yearOptions.map((year) => (
                          <option key={year} value={year} disabled={year >= endYear}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fr-col-auto" style={{ paddingBottom: "0.75rem" }}>
                    <span className="fr-text--lg" aria-hidden="true">
                      →
                    </span>
                  </div>

                  <div className="fr-col-auto">
                    <div className="fr-select-group">
                      <label className="fr-label" htmlFor="end-year">
                        Année de fin
                      </label>
                      <select
                        className="fr-select"
                        id="end-year"
                        value={endYear}
                        onChange={(e) => onEndYearChange(Number(e.target.value))}
                      >
                        {yearOptions.map((year) => (
                          <option key={year} value={year} disabled={year <= startYear}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {hasChangedFromDefault && (
                    <div className="fr-col-auto">
                      <button
                        onClick={handleReset}
                        className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-left"
                        title={`Réinitialiser à la période ${defaultStartYear}-${defaultEndYear}`}
                      >
                        Réinitialiser
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
    </div>
  );
};
