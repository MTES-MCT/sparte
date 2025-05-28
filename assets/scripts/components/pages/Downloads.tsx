import React, { useState, ReactNode } from 'react';
import Guide from '@components/ui/Guide';
import { useDownloadDiagnosticMutation } from '@services/api';
import { ProjectDetailResultType } from "@services/types/project";

interface ReportConfig {
    title: string;
    description: string;
    documentType: string;
}

interface NoticeProps {
    type: 'success' | 'warning';
    message: string | ReactNode;
    reportTitle: string;
}

interface DownloadCardProps {
    report: ReportConfig;
    onDownload: (report: ReportConfig) => void;
    isDisabled: boolean;
}

interface DownloadsProps {
    projectData: ProjectDetailResultType;
}

const NOTICE_TITLES = {
    success: (reportTitle: string) => `Votre demande de téléchargement du rapport ${reportTitle} a bien été prise en compte`,
    warning: (reportTitle: string) => `Erreur lors de votre demande de téléchargement du rapport ${reportTitle}`
} as const;

const REPORTS: ReportConfig[] = [
    {
        title: "complet",
        description: "Analyse détaillée de l'évolution de la consommation d'espaces NAF (naturels, agricoles et forestiers) et de l'artificialisation des sols sur votre territoire, incluant les indicateurs clés, au regard de la loi climat et résilience.",
        documentType: "rapport-complet"
    },
    {
        title: "triennal local",
        description: "Trame pré-remplie du rapport triennal local de suivi de l'artificialisation des sols de votre territoire réalisée en partenariat avec la DGALN.",
        documentType: "rapport-local"
    }
];

const Notice: React.FC<NoticeProps> = ({ type, message, reportTitle }) => (
    <div className={`bg-white fr-mt-2w fr-alert fr-alert--${type}`}>
        <h3 className="fr-alert__title">{NOTICE_TITLES[type](reportTitle)}</h3>
        <p>{message}</p>
    </div>
);

const DownloadCard: React.FC<DownloadCardProps> = ({ report, onDownload, isDisabled }) => (
    <div className={`fr-card fr-enlarge-link ${isDisabled ? 'fr-card--disabled' : ''}`}>
        <div className="fr-card__body">
            <div className="fr-card__content">
                <h3 className="fr-card__title">
                    <a 
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isDisabled) onDownload(report);
                        }} 
                        href="#"
                        aria-disabled={isDisabled}
                    >
                        Rapport {report.title}
                    </a>
                </h3>
                <p className="fr-card__desc">{report.description}</p>
                <div className="fr-card__end">
                    <p className="fr-card__detail">
                        Télécharger le rapport {report.title} au format Word
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const Downloads: React.FC<DownloadsProps> = ({ projectData }) => {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<ReactNode | null>(null);
    const [disabledDocuments, setDisabledDocuments] = useState<Set<string>>(new Set());
    const [currentReport, setCurrentReport] = useState<ReportConfig | null>(null);
    const [downloadDiagnostic] = useDownloadDiagnosticMutation();

    const handleDownload = async (report: ReportConfig) => {
        if (disabledDocuments.has(report.documentType)) return;

        setError(null);
        setMessage(null);
        setCurrentReport(report);
        setDisabledDocuments(new Set([report.documentType]));

        try {
            const response = await downloadDiagnostic({ 
                projectId: projectData.id, 
                documentType: report.documentType 
            }).unwrap();
            setMessage(response.message);
        } catch (error: any) {
            setError(error.data?.error || 'Une erreur est survenue');
        }
    };

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide title="Qu'y a-t-il dans nos rapports téléchargeables ?">
                        <p>Nos rapports téléchargeables vous permettent d'accéder à des analyses détaillées de l'évolution de l'artificialisation des sols, des données quantitatives sur la consommation d'espaces NAF (naturels, agricoles et forestiers), ainsi qu'à des cartographies des zones concernées.</p>
                        <p>Ces documents sont régulièrement mis à jour pour refléter les dernières données disponibles et les évolutions réglementaires.</p>
                    </Guide>
                    {message && currentReport && (
                        <Notice 
                            type="success" 
                            message={message} 
                            reportTitle={currentReport.title} 
                        />
                    )}
                    {error && currentReport && (
                        <Notice 
                            type="warning" 
                            message={<span dangerouslySetInnerHTML={{ __html: error }} />} 
                            reportTitle={currentReport.title} 
                        />
                    )}
                    <div className="fr-grid-row fr-grid-row--gutters fr-mt-2w">
                        {REPORTS.map((report) => (
                            <div key={report.documentType} className="fr-col-12 fr-col-md-6">
                                <DownloadCard
                                    report={report}
                                    onDownload={handleDownload}
                                    isDisabled={disabledDocuments.has(report.documentType)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Downloads;
