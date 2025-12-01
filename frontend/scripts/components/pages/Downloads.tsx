import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import Guide from '@components/ui/Guide';
import { RootState } from '@store/store';
import { selectPdfExportStatus, selectPdfExportBlobUrl, selectPdfExportError } from '@store/pdfExportSlice';

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

const Downloads: React.FC = () => {
    const pdfStatus = useSelector((state: RootState) => selectPdfExportStatus(state));
    const pdfBlobUrl = useSelector((state: RootState) => selectPdfExportBlobUrl(state));
    const pdfError = useSelector((state: RootState) => selectPdfExportError(state));

    const isLoading = pdfStatus === 'loading';
    const isReady = pdfStatus === 'succeeded' && pdfBlobUrl;
    const hasFailed = pdfStatus === 'failed';

    const handleClick = () => {
        if (!pdfBlobUrl) return;

        const link = document.createElement('a');
        link.href = pdfBlobUrl;
        link.download = 'rapport-complet.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getButtonText = () => {
        if (isLoading) return 'Génération du PDF en cours, veuillez patienter...';
        if (isReady) return 'Télécharger le rapport complet (PDF)';
        if (hasFailed) return 'Erreur - Réessayer';
        return 'Préparation du rapport...';
    };

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide title="Qu'y a-t-il dans nos rapports téléchargeables ?">
                        <p>Nos rapports téléchargeables vous permettent d'accéder à des analyses détaillées de l'évolution de l'artificialisation des sols, des données quantitatives sur la consommation d'espaces NAF (naturels, agricoles et forestiers), ainsi qu'à des cartographies des zones concernées.</p>
                        <p>Ces documents sont régulièrement mis à jour pour refléter les dernières données disponibles et les évolutions réglementaires.</p>
                    </Guide>

                    {hasFailed && pdfError && (
                        <Notice
                            type="warning"
                            message={pdfError}
                            reportTitle="complet"
                        />
                    )}

                    <div className="fr-mt-3w">
                        <button
                            className="fr-btn"
                            onClick={handleClick}
                            disabled={!isReady}
                            aria-busy={isLoading}
                        >
                            {isLoading && (
                                <span className="fr-spinner fr-spinner--sm fr-mr-1w" aria-hidden="true" />
                            )}
                            {getButtonText()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Downloads;
