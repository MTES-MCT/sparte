import React from 'react';
import { LOGEMENT_VACANT_ICON_CONFIG, LOGEMENT_VACANT_BADGE_CONFIG } from "./constant";
import Card from "@components/ui/Card";

interface LogementVacantOverviewProps {
    className?: string;
}

const LogementVacantStatusCards: React.FC<{ className?: string }> = () => {
    return (
        <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
            <div className="fr-col-12 fr-col-lg-6">
                <Card
                    icon={LOGEMENT_VACANT_ICON_CONFIG['parc privé']?.icon || 'bi bi-circle'}
                    badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['parc privé']}
                    badgeLabel={'parc privé'}
                    value={12}
                    label={`Soit 3% du parc total`}
                    isHighlighted={true}
                    highlightBadge="Actionnable"
                />
            </div>
            <div className="fr-col-12 fr-col-lg-6">
                <Card
                    icon={LOGEMENT_VACANT_ICON_CONFIG['bailleurs sociaux']?.icon || 'bi bi-circle'}
                    badgeClass={LOGEMENT_VACANT_BADGE_CONFIG['bailleurs sociaux']}
                    badgeLabel={'bailleurs sociaux'}
                    value={8}
                    label={`Soit 4% du parc total`}
                    isHighlighted={true}
                    highlightBadge="Actionnable"
                />
            </div>
        </div>
    );
};

const LogementVacantOverview: React.FC<LogementVacantOverviewProps> = ({ 
    className,
}) => {
    return (
        <div className={className}>
            <LogementVacantStatusCards />
        </div>
    );
};

export default LogementVacantOverview; 