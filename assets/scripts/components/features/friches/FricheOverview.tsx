import React from 'react';
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";
import { FricheStatusDetails, FricheStatusEnum, LandDetailResultType } from "@services/types/land";
import { STATUT_BADGE_CONFIG, STATUT_CONFIG } from "@components/map/friches/constants";

const OverviewCard = styled.div<{ $isHighlighted?: boolean }>`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    ${({ $isHighlighted }) => $isHighlighted && `
        border: 3px solid var(--artwork-major-blue-france);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        position: relative;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    `}
`;

const OverviewHighlightBadge = styled.div`
    position: absolute;
    top: -10px;
    right: 10px;
    background: var(--artwork-major-blue-france);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const OverviewCardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const OverviewCardIcon = styled.i<{ $isHighlighted?: boolean }>`
    font-size: 2.5rem;
    ${({ $isHighlighted }) => $isHighlighted && `
        color: var(--artwork-major-blue-france);
    `}
`;

const OverviewCardBadge = styled.span`
    font-size: 1rem;
    text-transform: lowercase;
`;

const OverviewCardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const OverviewCardValue = styled.div<{ $isHighlighted?: boolean }>`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
	${({ $isHighlighted }) => $isHighlighted && `
	    color: var(--artwork-major-blue-france);
	`}
`;

const OverviewCardLabel = styled.p`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0;
`;

const SobrieteSection = styled.div`
    margin-bottom: 5rem;
    margin-top: 5rem;
`;

const SobrieteCard = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 4px;
    margin-bottom: 2rem;
`;

const FricheOverviewCard: React.FC<{
    friche_count: number;
    friche_surface: number;
    friche_statut: string;
}> = ({ friche_count, friche_surface, friche_statut }) => {
    const { icon } = STATUT_CONFIG[friche_statut as keyof typeof STATUT_CONFIG] || { 
        icon: 'bi bi-circle'
    };
    
    const isHighlighted = friche_statut === 'friche sans projet';

    return (
        <OverviewCard $isHighlighted={isHighlighted}>
            {isHighlighted && (
                <OverviewHighlightBadge>
                    <i className="bi bi-lightning-charge"></i> Actionnable
                </OverviewHighlightBadge>
            )}
            <OverviewCardHeader>
                <OverviewCardIcon className={icon} $isHighlighted={isHighlighted} />
                <OverviewCardBadge className={`fr-badge fr-badge--no-icon ${STATUT_BADGE_CONFIG[friche_statut as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                    {friche_statut}
                </OverviewCardBadge>
            </OverviewCardHeader>
            <OverviewCardContent>
                <OverviewCardValue $isHighlighted={isHighlighted}>{friche_count}</OverviewCardValue>
                <OverviewCardLabel>Soit {formatNumber({ number: friche_surface })} ha</OverviewCardLabel>
            </OverviewCardContent>
        </OverviewCard>
    );
};

const FricheStatus: React.FC<{ landData: LandDetailResultType }> = ({ landData }) => {
    const { friche_status, name, friche_status_details } = landData;
    const { 
        friche_reconvertie_count, 
        friche_reconvertie_surface, 
        friche_avec_projet_count, 
        friche_avec_projet_surface, 
        friche_sans_projet_count, 
        friche_sans_projet_surface 
    } = friche_status_details;

    let statusText = '';

    if (friche_status === FricheStatusEnum.GISEMENT_NUL_ET_SANS_POTENTIEL) {
        statusText = `D'après les données disponibles, il n'y a actuellement <strong>aucune friche sans projet</strong> sur le territoire de ${name}.<br />
        <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />`;
    } else if (friche_status === FricheStatusEnum.GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE) {
        statusText = `D'après les données disponibles, il n'y a actuellement <strong>aucune friche sans projet</strong> sur le territoire de ${name}.
        L'absence de friches sans projet est due à l'exploitation du potentiel des friches existantes.<br />
        En effet ${friche_reconvertie_count} friche${friche_reconvertie_count > 0 ? 's' : ''} ont été reconvertie${friche_reconvertie_count > 0 ? 's' : ''}, représentant une surface totale de <strong>${formatNumber({ number: friche_reconvertie_surface })} ha</strong>,
        et ${friche_avec_projet_count} friche${friche_avec_projet_count > 0 ? 's' : ''} sont actuellement en projet, représentant une surface totale de <strong>${formatNumber({ number: friche_avec_projet_surface })} ha.</strong><br />
        <strong>La réhabilitation de friches ne semble plus être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />`;
    } else if (friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE || friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION) {
        statusText = `D'après les données disponibles, il y a actuellement <strong>${friche_sans_projet_count} friche${friche_sans_projet_count > 0 ? 's' : ''} sans projet</strong> sur le territoire de ${name}, représentant une surface totale de <strong>${formatNumber({ number: friche_sans_projet_surface })} ha</strong>.<br />
        <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />`;
    }

    return (
        <SobrieteSection>
            <SobrieteCard>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12">
                        <h3 className="fr-text--lg fr-mb-2w">
                            <i className="bi bi-lightning-charge text-primary fr-mr-1w" /> 
                            Les friches sans projet : un levier majeur actionnable pour la sobriété foncière
                        </h3>
                        <p className="fr-text--sm" dangerouslySetInnerHTML={{ __html: statusText }} />
                    </div>
                </div>
            </SobrieteCard>
        </SobrieteSection>
    );
};

const FricheStatsGrid: React.FC<{ friche_status_details: FricheStatusDetails; className?: string }> = ({ 
    friche_status_details, 
    className = "" 
}) => {
    const {
        friche_sans_projet_surface,
        friche_avec_projet_surface,
        friche_reconvertie_surface,
        friche_sans_projet_count,
        friche_avec_projet_count,
        friche_reconvertie_count
    } = friche_status_details;

    return (
        <div className={`fr-grid-row fr-grid-row--gutters fr-mt-3w ${className}`}>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FricheOverviewCard
                    friche_count={friche_sans_projet_count}
                    friche_surface={friche_sans_projet_surface}
                    friche_statut={'friche sans projet'}
                />
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FricheOverviewCard
                    friche_count={friche_avec_projet_count}
                    friche_surface={friche_avec_projet_surface}
                    friche_statut={'friche avec projet'}
                />
            </div>
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                <FricheOverviewCard
                    friche_count={friche_reconvertie_count}
                    friche_surface={friche_reconvertie_surface}
                    friche_statut={'friche reconvertie'}
                />
            </div>
        </div>
    );
};

interface FricheOverviewProps {
    friche_status_details: FricheStatusDetails;
    landData: LandDetailResultType;
    className?: string;
}

const FricheOverview: React.FC<FricheOverviewProps> = ({ 
    friche_status_details, 
    landData,
}) => {
    return (
        <>
            <FricheStatsGrid 
                friche_status_details={friche_status_details} 
            />
            <FricheStatus landData={landData} />
        </>
    );
};

export default FricheOverview; 