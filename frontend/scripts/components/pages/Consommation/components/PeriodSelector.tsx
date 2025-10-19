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
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        maxWidth: "320px",
      }}
    >
      <div
        className="bg-white rounded"
        style={{
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e5e5",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span
            className="fr-icon-calendar-line"
            style={{ color: "#6a6af4", fontSize: "1.25rem" }}
            aria-hidden="true"
          ></span>
          <h6 className="fr-mb-0" style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#161616" }}>
            Période d'analyse
          </h6>
        </div>

        <div className="fr-grid-row fr-grid-row--gutters" style={{ marginBottom: "0.75rem" }}>
          <div className="fr-col-6">
            <label
              className="fr-label"
              htmlFor="start-year"
              style={{ fontSize: "0.75rem", marginBottom: "0.375rem", fontWeight: 500 }}
            >
              Début
            </label>
            <select
              className="fr-select"
              id="start-year"
              value={startYear}
              onChange={(e) => onStartYearChange(Number(e.target.value))}
              style={{
                fontSize: "0.875rem",
                padding: "0.375rem 0.5rem",
                borderColor: "#6a6af4",
              }}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year} disabled={year >= endYear}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="fr-col-6">
            <label
              className="fr-label"
              htmlFor="end-year"
              style={{ fontSize: "0.75rem", marginBottom: "0.375rem", fontWeight: 500 }}
            >
              Fin
            </label>
            <select
              className="fr-select"
              id="end-year"
              value={endYear}
              onChange={(e) => onEndYearChange(Number(e.target.value))}
              style={{
                fontSize: "0.875rem",
                padding: "0.375rem 0.5rem",
                borderColor: "#6a6af4",
              }}
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
          <button
            onClick={handleReset}
            className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
            style={{
              width: "100%",
              fontSize: "0.75rem",
              padding: "0.375rem",
            }}
          >
            <span className="fr-icon-refresh-line" aria-hidden="true" style={{ marginRight: "0.25rem" }}></span>
            Réinitialiser ({defaultStartYear}-{defaultEndYear})
          </button>
        )}
      </div>
    </div>
  );
};
