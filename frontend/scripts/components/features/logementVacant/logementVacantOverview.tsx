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

    // Vérifie si les données sont disponibles pour chaque parc
    const hasPriveData = logements_vacants_parc_prive !== null;
    const hasSocialData = logements_vacants_parc_social !== null;

    return (
        <div className={className}>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12 fr-col-lg-6">
                    <Card
                        icon={LOGEMENT_VACANT_ICON_CONFIG['parc privé']?.icon}
                        badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['parc privé']}
                        badgeLabel={'logements vacants dans le parc privé'}
                        value={hasPriveData ? formatNumber({ number: logements_vacants_parc_prive }) : 'Indisponible'}
                        label={hasPriveData
                            ? `Soit ${formatNumber({ number: logements_vacants_parc_prive_percent })} % du parc privé total`
                            : 'Secret statistique'
                        }
                        isHighlighted={hasPriveData && logements_vacants_parc_prive > 0}
                        highlightBadge={hasPriveData && logements_vacants_parc_prive > 0 ? "Actionnable" : undefined}
                    />
                </div>
                <div className="fr-col-12 fr-col-lg-6">
                    <Card
                        icon={LOGEMENT_VACANT_ICON_CONFIG['bailleurs sociaux']?.icon}
                        badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['bailleurs sociaux']}
                        badgeLabel={'logements vacants dans le parc des bailleurs sociaux'}
                        value={hasSocialData ? formatNumber({ number: logements_vacants_parc_social }) : 'Indisponible'}
                        label={hasSocialData
                            ? `Soit ${formatNumber({ number: logements_vacants_parc_social_percent })} % du parc bailleurs sociaux total`
                            : 'Données non disponibles'
                        }
                        isHighlighted={hasSocialData && logements_vacants_parc_social > 0}
                        highlightBadge={hasSocialData && logements_vacants_parc_social > 0 ? "Actionnable" : undefined}
                    />
                </div>
            </div>
        </div>
    );
};

export default LogementVacantOverview;
