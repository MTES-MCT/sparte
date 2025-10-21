import React from 'react';
import { formatNumber } from "@utils/formatUtils";
import { FricheStatusDetails } from "@services/types/land";
import { FRICHE_STATUS_CONFIG, STATUT_BADGE_CONFIG } from "./constants";
import Card from "@components/ui/Card";

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
        friche_avec_projet_surface,
        friche_avec_projet_surface_artif,
        friche_reconvertie_surface,
        friche_reconvertie_surface_artif,
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
                        value={friche_sans_projet_count}
                        label={`${formatNumber({number: friche_sans_projet_surface})} ha, dont ${formatNumber({ number: friche_sans_projet_surface_artif })} ha artificialisés`}
                        isHighlighted={true}
                        highlightBadge="Actionnable"
                    />
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <Card
                        icon={FRICHE_STATUS_CONFIG['friche avec projet']?.icon || 'bi bi-circle'}
                        badgeClass={STATUT_BADGE_CONFIG['friche avec projet']}
                        badgeLabel={'friche avec projet'}
                        value={friche_avec_projet_count}
                        label={`${formatNumber({ number: friche_avec_projet_surface })} ha, dont ${formatNumber({ number: friche_avec_projet_surface_artif })} ha artificialisés`}
                        isHighlighted={false}
                    />
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <Card
                        icon={FRICHE_STATUS_CONFIG['friche reconvertie']?.icon || 'bi bi-circle'}
                        badgeClass={STATUT_BADGE_CONFIG['friche reconvertie']}
                        badgeLabel={'friche reconvertie'}
                        value={friche_reconvertie_count}
                        label={`${formatNumber({ number: friche_reconvertie_surface })} ha, dont ${formatNumber({ number: friche_reconvertie_surface_artif })} ha artificialisés`}
                        isHighlighted={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default FricheOverview;
