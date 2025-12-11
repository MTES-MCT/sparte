import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { FullPageContainer } from "../styles";

interface TerritoryInfoSectionProps {
    landData: LandDetailResultType;
    consoStartYear: number;
    consoEndYear: number;
}

const PageContainer = styled(FullPageContainer)`
    justify-content: flex-start;
`;

const PageHeader = styled.div`
    text-align: center;
    margin-bottom: 2rem;
`;

const PageTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 700;
    color: #000091;
    margin: 0 0 0.5rem 0;
`;

const PageDescription = styled.p`
    font-size: 0.95rem;
    color: #666;
    margin: 0;
`;

const DataPeriods = styled.div`
    margin-top: 2rem;
`;

const PeriodsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
`;

const PeriodItem = styled.div<{ $available?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: ${props => props.$available ? 'white' : '#f8f8f8'};
    border: 2px solid ${props => props.$available ? '#e5e5e5' : '#ddd'};
    border-radius: 12px;
    flex-wrap: nowrap;
    gap: 1rem;
    opacity: ${props => props.$available ? '1' : '0.6'};
`;

const PeriodContent = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
`;

const PeriodIcon = styled.i`
    font-size: 1.5rem;
    flex-shrink: 0;
    color: #000091;
`;

const PeriodInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const PeriodLabel = styled.div`
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
    margin-bottom: 0.25rem;
`;

const PeriodSource = styled.div`
    font-size: 0.75rem;
    color: #666;
    font-style: italic;
`;

const MillesimesList = styled.div`
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #000091;
    font-weight: 600;
    align-items: flex-start;
`;

const MillesimeColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
`;

const MillesimeGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const MillesimeIndex = styled.div`
    font-size: 0.8rem;
    color: #000091;
    font-weight: 700;
`;

const MillesimeYears = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-left: 0.5rem;
`;

const MillesimeItem = styled.span`
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
`;

const MillesimeDepartement = styled.span`
    font-size: 0.75rem;
    color: #666;
    font-weight: 400;
`;

const PeriodValue = styled.div<{ $available?: boolean }>`
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.$available ? '#000091' : '#999'};
    white-space: nowrap;
`;

const TerritoryInfoSection: React.FC<TerritoryInfoSectionProps> = ({ landData, consoStartYear, consoEndYear }) => {
    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Disponibilité des données</PageTitle>
                <PageDescription>Sources de données et périodes couvertes dans ce rapport</PageDescription>
            </PageHeader>

            <DataPeriods>
                <PeriodsGrid>
                    {/* Consommation NAF */}
                    <PeriodItem $available={landData.has_conso}>
                        <PeriodContent>
                            <PeriodIcon className="bi bi-bar-chart" />
                            <PeriodInfo>
                                <PeriodLabel>Consommation d'espaces NAF (Naturels, Agricoles et Forestiers)</PeriodLabel>
                                <PeriodSource>Source : Fichiers fonciers (Cerema)</PeriodSource>
                            </PeriodInfo>
                        </PeriodContent>
                        <PeriodValue $available={landData.has_conso}>
                            {landData.has_conso ? `${consoStartYear} - ${consoEndYear}` : 'Non disponible'}
                        </PeriodValue>
                    </PeriodItem>

                    {/* OCS GE - Artificialisation */}
                    <PeriodItem $available={landData.has_ocsge}>
                        <PeriodContent>
                            <PeriodIcon className="bi bi-geo-alt" />
                            <PeriodInfo>
                                <PeriodLabel>Artificialisation des sols</PeriodLabel>
                                <PeriodSource>Source : OCS GE (IGN)</PeriodSource>
                            </PeriodInfo>
                        </PeriodContent>
                        {(() => {
                            if (!landData.has_ocsge || !landData.millesimes || landData.millesimes.length === 0) {
                                return <PeriodValue $available={false}>Non disponible</PeriodValue>;
                            }

                            if (!landData.is_interdepartemental) {
                                return (
                                    <PeriodValue $available>
                                        {Math.min(...landData.millesimes.map(m => m.year))} - {Math.max(...landData.millesimes.map(m => m.year))}
                                    </PeriodValue>
                                );
                            }

                            // Interdépartemental: millésime 1 à gauche, les autres à droite
                            const millesime1 = landData.millesimes_by_index?.find(m => m.index === 1);
                            const autresMillesimes = landData.millesimes_by_index?.filter(m => m.index !== 1) || [];

                            return (
                                <MillesimesList>
                                    {millesime1 && (
                                        <MillesimeColumn>
                                            <MillesimeGroup>
                                                <MillesimeIndex>Millésime {millesime1.index}</MillesimeIndex>
                                                <MillesimeYears>
                                                    {landData.millesimes
                                                        .filter(m => m.index === millesime1.index)
                                                        .map((millesime) => (
                                                            <MillesimeItem key={`${millesime.year}-${millesime.departement}`}>
                                                                {millesime.year}
                                                                {millesime.departement && (
                                                                    <MillesimeDepartement> ({millesime.departement})</MillesimeDepartement>
                                                                )}
                                                            </MillesimeItem>
                                                        ))}
                                                </MillesimeYears>
                                            </MillesimeGroup>
                                        </MillesimeColumn>
                                    )}
                                    {autresMillesimes.length > 0 && (
                                        <MillesimeColumn>
                                            {autresMillesimes.map((millesimeIndex) => {
                                                const yearsByIndex = landData.millesimes.filter(m => m.index === millesimeIndex.index);
                                                return (
                                                    <MillesimeGroup key={millesimeIndex.index}>
                                                        <MillesimeIndex>Millésime {millesimeIndex.index}</MillesimeIndex>
                                                        <MillesimeYears>
                                                            {yearsByIndex.map((millesime) => (
                                                                <MillesimeItem key={`${millesime.year}-${millesime.departement}`}>
                                                                    {millesime.year}
                                                                    {millesime.departement && (
                                                                        <MillesimeDepartement> ({millesime.departement})</MillesimeDepartement>
                                                                    )}
                                                                </MillesimeItem>
                                                            ))}
                                                        </MillesimeYears>
                                                    </MillesimeGroup>
                                                );
                                            })}
                                        </MillesimeColumn>
                                    )}
                                </MillesimesList>
                            );
                        })()}
                    </PeriodItem>

                </PeriodsGrid>
            </DataPeriods>

        </PageContainer>
    );
};

export default TerritoryInfoSection;
