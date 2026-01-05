import React from 'react';
import styled from 'styled-components';
import { formatNumber } from "@utils/formatUtils";
import { FricheStatusDetails } from "@services/types/land";
import { FRICHE_STATUS_CONFIG, STATUT_BADGE_CONFIG } from "./constants";
import Card from "@components/ui/Card";
import { pluralize } from "@utils/formatUtils";

const StatsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.25rem;
`;

const StatRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: var(--background-alt-blue-france);
    border-left: 3px solid var(--text-action-high-blue-france);
    border-radius: 0 4px 4px 0;
    color: var(--text-action-high-blue-france);
`;


interface SurfaceStatsProps {
    artif: number;
    imper: number;
}

const SurfaceStats: React.FC<SurfaceStatsProps> = ({ artif, imper }) => (
    <StatsContainer>
        <StatRow>
            <i className="bi bi-buildings" />
            <div>{formatNumber({ number: artif })} ha</div>
            <div>artificialisés</div>
        </StatRow>
        <StatRow>
            <i className="bi bi-droplet" />
            <div>{formatNumber({ number: imper })} ha</div>
            <div>imperméables</div>
        </StatRow>
    </StatsContainer>
);

interface FricheOverviewProps {
    friche_status_details: FricheStatusDetails;
    className?: string;
}

const FricheOverview: React.FC<FricheOverviewProps> = ({ 
    friche_status_details, 
    className,
}) => {
    const {
        friche_sans_projet_surface,
        friche_sans_projet_surface_artif,
        friche_sans_projet_surface_imper,
        friche_avec_projet_surface,
        friche_avec_projet_surface_artif,
        friche_avec_projet_surface_imper,
        friche_reconvertie_surface,
        friche_reconvertie_surface_artif,
        friche_reconvertie_surface_imper,
        friche_sans_projet_count,
        friche_avec_projet_count,
        friche_reconvertie_count
    } = friche_status_details;

    return (
        <div className={className}>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <Card
                        icon={FRICHE_STATUS_CONFIG['friche sans projet']?.icon || 'bi bi-circle'}
                        badgeClass={STATUT_BADGE_CONFIG['friche sans projet']}
                        badgeLabel={'friche sans projet'}
                        value={
                            <>
                                {formatNumber({ number: friche_sans_projet_surface })} ha
                                <span className="fr-tag fr-ml-2w">
                                    {friche_sans_projet_count} {pluralize(friche_sans_projet_count, 'friche')}
                                </span>
                            </>
                        }
                        label={
                            <SurfaceStats 
                                artif={friche_sans_projet_surface_artif} 
                                imper={friche_sans_projet_surface_imper} 
                            />
                        }
                        isHighlighted={true}
                        highlightBadge="Actionnable"
                    />
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <Card
                        icon={FRICHE_STATUS_CONFIG['friche avec projet']?.icon || 'bi bi-circle'}
                        badgeClass={STATUT_BADGE_CONFIG['friche avec projet']}
                        badgeLabel={'friche avec projet'}
                        value={
                            <>
                                {formatNumber({ number: friche_avec_projet_surface })} ha
                                <span className="fr-tag fr-ml-2w">
                                    {friche_avec_projet_count} {pluralize(friche_avec_projet_count, 'friche')}
                                </span>
                            </>
                        }
                        label={
                            <SurfaceStats 
                                artif={friche_avec_projet_surface_artif} 
                                imper={friche_avec_projet_surface_imper} 
                            />
                        }
                        isHighlighted={false}
                    />
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <Card
                        icon={FRICHE_STATUS_CONFIG['friche reconvertie']?.icon || 'bi bi-circle'}
                        badgeClass={STATUT_BADGE_CONFIG['friche reconvertie']}
                        badgeLabel={'friche reconvertie'}
                        value={
                            <>
                                {formatNumber({ number: friche_reconvertie_surface })} ha
                                <span className="fr-tag fr-ml-2w">
                                    {friche_reconvertie_count} {pluralize(friche_reconvertie_count, 'friche')}
                                </span>
                            </>
                        }
                        label={
                            <SurfaceStats 
                                artif={friche_reconvertie_surface_artif} 
                                imper={friche_reconvertie_surface_imper} 
                            />
                        }
                        isHighlighted={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default FricheOverview;
