import React from 'react';
import { formatNumber } from "@utils/formatUtils";
import { LogementsVacantsStatusDetails } from "@services/types/land";
import { LOGEMENT_VACANT_ICON_CONFIG, LOGEMENT_VACANT_BADGE_CONFIG } from "./constant";
import Card from "@components/ui/Card";

interface LogementVacantOverviewProps {
    logements_vacants_status_details: LogementsVacantsStatusDetails;
    className?: string;
}

const LogementVacantOverview: React.FC<LogementVacantOverviewProps> = ({ 
    logements_vacants_status_details,
    className,
}) => {
    const {
        logements_vacants_parc_prive,
        logements_vacants_parc_social,
        logements_vacants_parc_prive_percent,
        logements_vacants_parc_social_percent,
    } = logements_vacants_status_details;

    return (
        <div className={className}>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12 fr-col-lg-6">
                    <Card
                        icon={LOGEMENT_VACANT_ICON_CONFIG['parc privé']?.icon}
                        badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['parc privé']}
                        badgeLabel={'logements vacants dans le parc privé'}
                        value={logements_vacants_parc_prive}
                        label={`Soit ${formatNumber({ number: logements_vacants_parc_prive_percent })} % du parc privé total`}
                        isHighlighted={true}
                        highlightBadge="Actionnable"
                    />
                </div>
                <div className="fr-col-12 fr-col-lg-6">
                    <Card
                        icon={LOGEMENT_VACANT_ICON_CONFIG['bailleurs sociaux']?.icon}
                        badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['bailleurs sociaux']}
                        badgeLabel={'logements vacants dans le parc des bailleurs sociaux'}
                        value={logements_vacants_parc_social}
                        label={`Soit ${formatNumber({ number: logements_vacants_parc_social_percent })} % du parc bailleurs sociaux total`}
                        isHighlighted={true}
                        highlightBadge="Actionnable"
                    />
                </div>
            </div>
        </div>
    );
};

export default LogementVacantOverview;
