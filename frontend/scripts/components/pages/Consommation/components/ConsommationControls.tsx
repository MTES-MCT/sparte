import React from "react";
import styled from "styled-components";
import { useConsommationControls } from "../context/ConsommationControlsContext";

const ControlsRow = styled.div`
  min-height: 6rem;
`;

const CalendarIcon = styled.div`
  font-size: 1.25rem;
  color: var(--text-label-blue-france);
`;

const PeriodLabel = styled.span`
  font-weight: 600;
`;

const Separator = styled.div`
  padding: 0;
`;

const AnalysisLabel = styled.span`
  font-weight: 600;
`;

const SeparatorText = styled.div`
  padding: 0 0.5rem;
`;

export const ConsommationControls: React.FC = () => {
  const {
    startYear,
    endYear,
    setStartYear,
    setEndYear,
    minYear,
    maxYear,
    defaultStartYear,
    defaultEndYear,
    childLandTypes,
    childType,
    setChildType,
    landTypeLabels,
  } = useConsommationControls();

  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const hasChangedFromDefault = startYear !== defaultStartYear || endYear !== defaultEndYear;

  const handleReset = () => {
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
  };

  const controlsContent = (
    <ControlsRow className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
              <div className="fr-col-auto">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <CalendarIcon
                      className="fr-icon-calendar-line"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="fr-col-auto">
                    <PeriodLabel className="fr-text--sm fr-mb-0">
                      Période d'analyse
                    </PeriodLabel>
                  </div>
                </div>
              </div>


              <div className="fr-col">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                  <div className="fr-col-auto">
                    <select
                      className="fr-select fr-select--sm"
                      id="start-year"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      aria-label="Année de début"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year} disabled={year >= endYear}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Separator className="fr-col-auto">
                    <span className="fr-text--sm">-</span>
                  </Separator>

                  <div className="fr-col-auto">
                    <select
                      className="fr-select fr-select--sm"
                      id="end-year"
                      value={endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
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

                  {childLandTypes && childLandTypes.length > 1 && (
                    <>
                      <SeparatorText className="fr-col-auto">
                        <span className="fr-text--sm">|</span>
                      </SeparatorText>
                      <div className="fr-col-auto">
                        <AnalysisLabel className="fr-text--sm fr-mb-0">
                          Maille d'analyse
                        </AnalysisLabel>
                      </div>
                      <div className="fr-col-auto">
                        <select
                          className="fr-select fr-select--sm"
                          id="child-type"
                          value={childType || ''}
                          onChange={(e) => setChildType(e.target.value)}
                          aria-label="Maille d'analyse"
                        >
                          {childLandTypes.map((type) => (
                            <option key={type} value={type}>
                              {landTypeLabels[type] || type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
    </ControlsRow>
  );

  return controlsContent;
};
