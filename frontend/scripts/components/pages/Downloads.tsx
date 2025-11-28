import React, { ReactNode, useState } from 'react';
import Guide from '@components/ui/Guide';
import { useGetEnvironmentQuery } from '@services/api';
import { LandDetailResultType } from '@services/types/land';

interface NoticeProps {
    type: 'success' | 'warning';
    message: string | ReactNode;
    reportTitle: string;
}

const NOTICE_TITLES = {
    success: (reportTitle: string) => `Votre demande de téléchargement du rapport ${reportTitle} a bien été prise en compte`,
    warning: (reportTitle: string) => `Erreur lors de votre demande de téléchargement du rapport ${reportTitle}`
} as const;

export const Notice: React.FC<NoticeProps> = ({ type, message, reportTitle }) => (
    <div className={`bg-white fr-mt-2w fr-alert fr-alert--${type}`}>
        <h3 className="fr-alert__title">{NOTICE_TITLES[type](reportTitle)}</h3>
        <p>{message}</p>
    </div>
);

interface DownloadsProps {
    landData: LandDetailResultType;
}

const Downloads: React.FC<DownloadsProps> = ({ landData }) => {
    const { land_id, land_type } = landData || {}
    const { data: env } = useGetEnvironmentQuery(null);
    const exportServerUrl = env?.export_server_url ?? null;
    const [isLoading, setIsLoading] = useState(false);

    const pageUrl = `${globalThis.location.origin}/exports/rapport-complet/${land_type}/${land_id}`;
    const exportUrl = exportServerUrl ? `${exportServerUrl}/api/export?url=${encodeURIComponent(pageUrl)}` : null;

    const handleClick = () => {
        if (isLoading || !exportUrl) return;

        setIsLoading(true);
        globalThis.location.href = exportUrl;
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide title="Qu'y a-t-il dans nos rapports téléchargeables ?">
                        <p>Nos rapports téléchargeables vous permettent d'accéder à des analyses détaillées de l'évolution de l'artificialisation des sols, des données quantitatives sur la consommation d'espaces NAF (naturels, agricoles et forestiers), ainsi qu'à des cartographies des zones concernées.</p>
                        <p>Ces documents sont régulièrement mis à jour pour refléter les dernières données disponibles et les évolutions réglementaires.</p>
                    </Guide>
                    <div className="fr-mt-3w">
                        <button
                            className="fr-btn"
                            onClick={handleClick}
                            disabled={isLoading || !exportUrl}
                            aria-busy={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="fr-spinner fr-spinner--sm fr-mr-1w" aria-hidden="true" />
                                    Génération en cours...
                                </>
                            ) : (
                                'Télécharger le rapport complet (PDF)'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Downloads;
