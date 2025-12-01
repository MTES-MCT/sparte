import React, { ReactNode, useState } from 'react';
import { useSelector } from 'react-redux';
import Guide from '@components/ui/Guide';
import { RootState } from '@store/store';
import { selectPdfExportStatus, selectPdfExportBlobUrl, selectPdfExportError, selectPdfExportFileSize } from '@store/pdfExportSlice';
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

const sanitizeFilename = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
};

interface DownloadsProps {
    landData: LandDetailResultType;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const Downloads: React.FC<DownloadsProps> = ({ landData }) => {
    const pdfStatus = useSelector((state: RootState) => selectPdfExportStatus(state));
    const pdfBlobUrl = useSelector((state: RootState) => selectPdfExportBlobUrl(state));
    const pdfError = useSelector((state: RootState) => selectPdfExportError(state));
    const fileSize = useSelector((state: RootState) => selectPdfExportFileSize(state));
    const [hasDownloaded, setHasDownloaded] = useState(false);

    const isLoading = pdfStatus === 'loading';
    const isReady = pdfStatus === 'succeeded' && pdfBlobUrl;
    const hasFailed = pdfStatus === 'failed';

    const getFilename = (): string => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const territoryName = landData?.name || 'territoire';
        const landId = landData?.land_id || '';

        return `${sanitizeFilename(territoryName)}_${landId}_${timestamp}.pdf`;
    };

    const handleClick = () => {
        if (!pdfBlobUrl || hasDownloaded) return;

        const link = document.createElement('a');
        link.href = pdfBlobUrl;
        link.download = getFilename();
        document.body.appendChild(link);
        link.click();
        link.remove();
        setHasDownloaded(true);

        setTimeout(() => {
            setHasDownloaded(false);
        }, 6000);
    };

    const getButtonText = () => {
        const sizeText = fileSize ? ` (PDF - ${formatFileSize(fileSize)})` : '';
        if (hasDownloaded) return `Téléchargement effectué ✓${sizeText}`;
        if (isLoading) return 'Génération du PDF en cours, veuillez patienter...';
        if (isReady) return `Télécharger le rapport complet${sizeText}`;
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
                            disabled={!isReady || hasDownloaded}
                            aria-busy={isLoading}
                            style={hasDownloaded ? { backgroundColor: '#18753c', color: 'white' } : undefined}
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
