import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { useConsommationControls } from "../context/ConsommationControlsContext";

const StickyContainer = styled.div`
  position: sticky;
  top: 160px;
  z-index: 100;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
`;

const Card = styled.div`
  background: transparent;
`;

const CardBody = styled.div`
  padding: 0.75rem 1rem;
`;

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

const CardsContainer = styled.div`
  justify-content: flex-end;
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 4px;
  border: 2px solid var(--artwork-major-blue-france);
`;

const MetricIcon = styled.i`
  font-size: 1.5rem;
  color: var(--artwork-major-blue-france);
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-mention-grey);
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--artwork-major-blue-france);
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
    showStickyConsoCard,
    showStickyPerHabitantCard,
    showStickyPopulationCard,
    totalConsoHa,
    consoPerNewHabitant,
    populationEvolution,
    isLoadingConso,
    isLoadingPop,
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

  const formatPopulationEvolution = () => {
    if (isLoadingPop || populationEvolution === null) {
      return "...";
    }

    const sign = populationEvolution > 0 ? "+" : "";
    return `${sign}${formatNumber({ number: populationEvolution })} hab`;
  };

  return (
    <StickyContainer>
      <Card className="fr-card fr-card--no-border fr-card--shadow">
        <CardBody className="fr-card__body">
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


              <div className={showStickyConsoCard || showStickyPerHabitantCard || showStickyPopulationCard ? "fr-col-auto" : "fr-col"}>
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

              {(showStickyConsoCard || showStickyPerHabitantCard || showStickyPopulationCard) && (
                <div className="fr-col">
                  <CardsContainer className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                    {showStickyConsoCard && (
                      <div className="fr-col-auto">
                        <MetricCard>
                          <MetricIcon className="bi-graph-up"></MetricIcon>
                          <div>
                            <MetricLabel>
                              Consommation d'espaces
                            </MetricLabel>
                            <MetricValue>
                              {isLoadingConso || totalConsoHa === null
                                ? "..."
                                : `${formatNumber({ number: totalConsoHa, addSymbol: true })} ha`}
                            </MetricValue>
                          </div>
                        </MetricCard>
                      </div>
                    )}

                    {showStickyPerHabitantCard && (
                      <div className="fr-col-auto">
                        <MetricCard>
                          <MetricIcon className="bi-house"></MetricIcon>
                          <div>
                            <MetricLabel>
                              Consommation par nouvel habitant
                            </MetricLabel>
                            <MetricValue>
                              {consoPerNewHabitant}
                            </MetricValue>
                          </div>
                        </MetricCard>
                      </div>
                    )}

                    {showStickyPopulationCard && (
                      <div className="fr-col-auto">
                        <MetricCard>
                          <MetricIcon className="bi-people"></MetricIcon>
                          <div>
                            <MetricLabel>
                              Évolution de la population
                            </MetricLabel>
                            <MetricValue>
                              {formatPopulationEvolution()}
                            </MetricValue>
                          </div>
                        </MetricCard>
                      </div>
                    )}
                  </CardsContainer>
                </div>
              )}
            </ControlsRow>
          </CardBody>
        </Card>
    </StickyContainer>
  );
};
