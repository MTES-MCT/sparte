import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { FullPageContainer } from "../styles";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";

interface AvailableDataPageProps {
    landData: LandDetailResultType;
    consoStartYear: number;
    consoEndYear: number;
    mode?: 'edit' | 'print';
    onOpenSettings?: () => void;
}

const PageContainer = styled(FullPageContainer)`
    align-items: center;
    justify-content: center;
`;

const Title = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;

    .fr-h2 {
        color: #000091;
        font-size: 15pt !important;
        margin: 0;
    }

    p {
        @media print {
            font-size: 9pt !important;
        }
    }
`;

const PeriodsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 2rem;
    width: 100%;
`;

const PeriodItem = styled.div<{ $available?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 2rem;
    background: ${props => props.$available ? 'white' : '#f8f8f8'};
    border: 1px solid ${props => props.$available ? '#e5e5e5' : '#ddd'};
    border-radius: 4px;
    flex-wrap: nowrap;
    gap: 1rem;
    opacity: ${props => props.$available ? '1' : '0.6'};

    @media print {
        padding: 1.5rem 1rem;
    }
`;

const EditableInfo = styled.div`
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    
    @media print {
        display: none !important;
    }
`;

const EditableText = styled.p`
    font-size: 0.75rem;
    margin: 0 !important;
`;

const PeriodItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;

    @media print {
        p, span, em {
            font-size: 8pt !important;
        }
    }
`;

const AvailableDataPage: React.FC<AvailableDataPageProps> = ({ 
    landData, 
    consoStartYear, 
    consoEndYear,
    mode = 'print',
    onOpenSettings 
}) => {
    return (
        <PageContainer>
            <Title className="fr-mb-4w">
                <h2 className="fr-h2">Disponibilité des données</h2>
                <p className="fr-text--sm">Sources de données et périodes couvertes dans ce rapport</p>
            </Title>

            <PeriodsGrid>
                {/* Consommation NAF */}
                <PeriodItem $available={landData.has_conso}>
                    <PeriodItemHeader>
                        <div>
                            <p className="fr-text--sm fr-text--bold fr-mb-0">Consommation d'espaces NAF (Naturels, Agricoles et Forestiers)</p>
                            <p className="fr-text--xs fr-mb-0"><em>Source : Fichiers fonciers (Cerema)</em></p>
                        </div>
                        <span className="fr-text--bold fr-text--sm">
                            {landData.has_conso ? `${consoStartYear} - ${consoEndYear}` : 'Non disponible'}
                        </span>
                    </PeriodItemHeader>
                    {mode === 'edit' && onOpenSettings && landData.has_conso && (
                        <EditableInfo>
                            <EditableText>
                                <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" />
                                La période d'analyse peut être modifiée dans les paramètres du rapport
                            </EditableText>
                            <button 
                                className="fr-btn fr-btn--sm"
                                onClick={onOpenSettings}
                                title="Modifier la période"
                            >
                                Modifier
                            </button>
                        </EditableInfo>
                    )}
                </PeriodItem>

                {/* OCS GE - Artificialisation */}
                <PeriodItem $available={landData.has_ocsge}>
                    <PeriodItemHeader>
                        <div>
                            <p className="fr-text--sm fr-text--bold fr-mb-0">Artificialisation des sols</p>
                            <p className="fr-text--xs fr-mb-0"><em>Source : OCS GE (IGN)</em></p>
                        </div>
                    </PeriodItemHeader>
                    { landData.has_ocsge ? (
                        <LandMillesimeTable
                            millesimes={landData.millesimes}
                            territory_name={landData.name}
                            is_interdepartemental={landData.is_interdepartemental}
                            compact={true}
                        />
                    ) : (
                        <span className="fr-text--sm fr-text--bold">Non disponible</span>
                    )}
                </PeriodItem>
            </PeriodsGrid>
        </PageContainer>
    );
};

export default AvailableDataPage;
