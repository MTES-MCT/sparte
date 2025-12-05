import React from "react";
import styled from "styled-components";
import { useGetLandQuery, useGetReportDraftQuery } from "@services/api";
import { LandDetailResultType } from "@services/types/land";
import CoverPage from "./CoverPage";
import TerritoryInfoPage from "./TerritoryInfoPage";
import DefinitionSection from "./sections/DefinitionSection";
import TrajectoireSection from "./sections/TrajectoireSection";
import ConsoDetailSection from "./sections/ConsoDetailSection";
import ComparisonSection from "./sections/ComparisonSection";
import ArtifDefinitionSection from "./sections/ArtifDefinitionSection";
import ArtifDetailSection from "./sections/ArtifDetailSection";
import RepartitionSection from "./sections/RepartitionSection";

const LayoutContainer = styled.div`
    min-height: 100vh;
    background-color: #f6f6f6;
`;

const ExportContent = styled.main`
    max-width: 210mm;
    margin: 2rem auto;
    background: white;
    min-height: 297mm;
    position: relative;

    @media print {
        border: none !important;
        margin: 0;

        @page {
            size: A4;
        }
    }
`;

const MainContent = styled.div`
    padding: 20mm;
`;

const CustomContentBox = styled.div`
    background: #f0f7ff;
    border-left: 4px solid #000091;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 0 8px 8px 0;

    p {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        line-height: 1.7;
        color: #333;
    }

    p:last-child {
        margin-bottom: 0;
    }

    ul, ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    li {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }
`;

const CustomContent: React.FC<{ content?: string }> = ({ content }) => {
    if (!content || content === "<p></p>" || content.trim() === "") return null;
    return <CustomContentBox dangerouslySetInnerHTML={{ __html: content }} />;
};

interface RapportCompletContentProps {
    landData: LandDetailResultType;
    customContent: Record<string, string>;
}

const RapportCompletContent: React.FC<RapportCompletContentProps> = ({ landData, customContent }) => {
    const consoStartYear = 2011;
    const consoEndYear = 2023;

    return (
        <>
            <TerritoryInfoPage landData={landData} consoStartYear={consoStartYear} consoEndYear={consoEndYear} />
            
            <CustomContent content={customContent.intro} />
            
            <DefinitionSection />
            <TrajectoireSection landData={landData} />
            <ConsoDetailSection landData={landData} startYear={consoStartYear} endYear={consoEndYear} />
            
            <CustomContent content={customContent.conso_comment} />
            
            <ComparisonSection landData={landData} startYear={consoStartYear} endYear={consoEndYear} />
            
            <CustomContent content={customContent.comparison_comment} />
            
            {landData.has_ocsge && (
                <>
                    <ArtifDefinitionSection />
                    <ArtifDetailSection landData={landData} />
                    <RepartitionSection landData={landData} />
                    
                    <CustomContent content={customContent.artif_comment} />
                </>
            )}
            
            <CustomContent content={customContent.conclusion} />
        </>
    );
};

interface RapportDraftProps {
    draftId: string;
}

const RapportDraft: React.FC<RapportDraftProps> = ({ draftId }) => {
    const { data: draft, isLoading: isDraftLoading, error: draftError } = useGetReportDraftQuery(draftId);

    const { data: landData, isLoading: isLandLoading, error: landError } = useGetLandQuery(
        { land_type: draft?.land_type || "", land_id: draft?.land_id || "" },
        { skip: !draft?.land_type || !draft?.land_id }
    );

    if (isDraftLoading || isLandLoading) {
        return (
            <LayoutContainer>
                <ExportContent>
                    <MainContent>
                        <h1>Chargement du rapport...</h1>
                        <p>Veuillez patienter...</p>
                    </MainContent>
                </ExportContent>
            </LayoutContainer>
        );
    }

    if (draftError || !draft) {
        return (
            <LayoutContainer>
                <ExportContent>
                    <MainContent>
                        <h1>Erreur lors du chargement du rapport</h1>
                        <p>Le rapport demandé n'existe pas ou n'est pas accessible.</p>
                    </MainContent>
                </ExportContent>
            </LayoutContainer>
        );
    }

    if (landError || !landData) {
        return (
            <LayoutContainer>
                <ExportContent>
                    <MainContent>
                        <h1>Erreur lors du chargement des données</h1>
                        <p>Les données du territoire ne sont pas accessibles.</p>
                    </MainContent>
                </ExportContent>
            </LayoutContainer>
        );
    }

    const reportTitle = draft.report_type === "rapport-local" ? "Rapport Triennal Local" : "Rapport Complet";
    const reportSubtitle = draft.report_type === "rapport-local" 
        ? "Suivi de l'artificialisation des sols" 
        : "Diagnostic territorial de sobriété foncière";

    return (
        <LayoutContainer>
            <ExportContent>
                <CoverPage
                    landData={landData}
                    reportTitle={reportTitle}
                    reportSubtitle={reportSubtitle}
                />
                <MainContent>
                    <RapportCompletContent landData={landData} customContent={draft.content || {}} />
                </MainContent>
            </ExportContent>
        </LayoutContainer>
    );
};

export default RapportDraft;
