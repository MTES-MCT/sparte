import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { FullPageContainer } from "../styles";

interface AvailableDataPageProps {
    landData: LandDetailResultType;
    consoStartYear: number;
    consoEndYear: number;
}

const PageContainer = styled(FullPageContainer)`
    justify-content: flex-start;
`;

const PeriodsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 2rem;
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

const PeriodInfo = styled.div`
    flex: 1;
    min-width: 0;
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

const MillesimeYears = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-left: 0.5rem;
`;

const AvailableDataPage: React.FC<AvailableDataPageProps> = ({ landData, consoStartYear, consoEndYear }) => {
    return (
        <PageContainer>
            <div className="fr-text--center fr-mb-4w">
                <h2 className="fr-h2">Disponibilité des données</h2>
                <p className="fr-text--sm fr-text--alt">Sources de données et périodes couvertes dans ce rapport</p>
            </div>

            <PeriodsGrid>
                {/* Consommation NAF */}
                <PeriodItem $available={landData.has_conso}>
                    <PeriodContent>
                        <i className="bi bi-bar-chart fr-text--xl" style={{ color: '#000091' }} />
                        <PeriodInfo>
                            <p className="fr-text--sm fr-text--bold fr-mb-0">Consommation d'espaces NAF (Naturels, Agricoles et Forestiers)</p>
                            <p className="fr-text--xs fr-text--alt fr-mb-0"><em>Source : Fichiers fonciers (Cerema)</em></p>
                        </PeriodInfo>
                    </PeriodContent>
                    <span className={`fr-text--bold ${landData.has_conso ? '' : 'fr-text--alt'}`}>
                        {landData.has_conso ? `${consoStartYear} - ${consoEndYear}` : 'Non disponible'}
                    </span>
                </PeriodItem>

                {/* OCS GE - Artificialisation */}
                <PeriodItem $available={landData.has_ocsge}>
                    <PeriodContent>
                        <i className="bi bi-geo-alt fr-text--xl" style={{ color: '#000091' }} />
                        <PeriodInfo>
                            <p className="fr-text--sm fr-text--bold fr-mb-0">Artificialisation des sols</p>
                            <p className="fr-text--xs fr-text--alt fr-mb-0"><em>Source : OCS GE (IGN)</em></p>
                        </PeriodInfo>
                    </PeriodContent>
                    {(() => {
                        if (!landData.has_ocsge || !landData.millesimes || landData.millesimes.length === 0) {
                            return <span className="fr-text--alt">Non disponible</span>;
                        }

                        if (!landData.is_interdepartemental) {
                            return (
                                <span className="fr-text--bold">
                                    {Math.min(...landData.millesimes.map(m => m.year))} - {Math.max(...landData.millesimes.map(m => m.year))}
                                </span>
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
                                            <span className="fr-text--xs fr-text--bold">Millésime {millesime1.index}</span>
                                            <MillesimeYears>
                                                {landData.millesimes
                                                    .filter(m => m.index === millesime1.index)
                                                    .map((millesime) => (
                                                        <span key={`${millesime.year}-${millesime.departement}`} className="fr-text--xs">
                                                            {millesime.year}
                                                            {millesime.departement && (
                                                                <span className="fr-text--alt"> ({millesime.departement})</span>
                                                            )}
                                                        </span>
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
                                                    <span className="fr-text--xs fr-text--bold">Millésime {millesimeIndex.index}</span>
                                                    <MillesimeYears>
                                                        {yearsByIndex.map((millesime) => (
                                                            <span key={`${millesime.year}-${millesime.departement}`} className="fr-text--xs">
                                                                {millesime.year}
                                                                {millesime.departement && (
                                                                    <span className="fr-text--alt"> ({millesime.departement})</span>
                                                                )}
                                                            </span>
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
        </PageContainer>
    );
};

export default AvailableDataPage;
