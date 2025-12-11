import React from "react";
import { useGetLandQuery, useGetReportDraftQuery } from "@services/api";
import RapportComplet from './RapportComplet';
import RapportLocal from './RapportLocal';
import { PrintLayout, PrintContent, MainContent } from '../shared';

interface ReportPrintPageProps {
    draftId: string;
}

const ReportPrintPage: React.FC<ReportPrintPageProps> = ({ draftId }) => {
    const { data: draft, isLoading: isDraftLoading, error: draftError } = useGetReportDraftQuery(draftId);

    const { data: landData, isLoading: isLandLoading, error: landError } = useGetLandQuery(
        { land_type: draft?.land_type || "", land_id: draft?.land_id || "" },
        { skip: !draft?.land_type || !draft?.land_id }
    );

    if (isDraftLoading || isLandLoading) {
        return (
            <PrintLayout>
                <PrintContent>
                    <MainContent>
                        <h1>Chargement du rapport...</h1>
                        <p>Veuillez patienter...</p>
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    if (draftError || !draft) {
        return (
            <PrintLayout>
                <PrintContent>
                    <MainContent>
                        <h1>Erreur lors du chargement du rapport</h1>
                        <p>Le rapport demandé n'existe pas ou n'est pas accessible.</p>
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    if (landError || !landData) {
        return (
            <PrintLayout>
                <PrintContent>
                    <MainContent>
                        <h1>Erreur lors du chargement des données</h1>
                        <p>Les données du territoire ne sont pas accessibles.</p>
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    if (draft.report_type === 'rapport-local') {
        return (
            <RapportLocal
                landData={landData}
                content={draft.content || {}}
                mode="print"
            />
        );
    }

    return (
        <RapportComplet
            landData={landData}
            content={draft.content || {}}
            mode="print"
        />
    );
};

export default ReportPrintPage;
