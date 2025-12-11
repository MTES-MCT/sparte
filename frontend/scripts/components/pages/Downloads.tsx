import React from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import ActionCard from '@components/ui/ActionCard';
import {
    LoginPrompt,
    ReportCard,
    CreateReportModal,
    ReportEditor,
    LoadingState,
} from '@components/features/report';
import { useReportDrafts } from '@hooks/useReportDrafts';

const MainContent = styled.main`
    width: 100%;
`;

const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    width: 100%;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MyReportsSection = styled.section`
    margin-top: 2.5rem;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-title-grey);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--text-mention-grey);
    }
`;

const EmptyDrafts = styled.div`
    text-align: center;
    padding: 2rem;
    color: var(--text-mention-grey);
    font-size: 0.875rem;
    background: var(--background-alt-grey);
    border-radius: 0.5rem;
`;

interface DownloadsProps {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

const Downloads: React.FC<DownloadsProps> = ({ landData, projectData }) => {
    const isAuthenticated = projectData.header.menuItems.some(
        item => item.label === 'Mon compte' && item.shouldDisplay
    );

    const {
        selectedDraftId,
        selectedDraft,
        drafts,
        localContent,
        saveStatus,
        lastSavedTime,
        isDraftsLoading,
        isDraftLoading,
        isCreating,
        isPdfLoading,
        exportDisabled,
        prefilledReportType,
        handleContentChange,
        handleSelectDraft,
        handleDeleteDraft,
        handleRenameDraft,
        handleCreateDraft,
        handleCreateReportOfType,
        handleExportPdf,
        handleBack,
    } = useReportDrafts({
        projectId: projectData.id,
        downloadsUrl: projectData.urls.downloads,
        isAuthenticated,
    });

    if (!isAuthenticated) {
        return <LoginPrompt />;
    }

    return (
        <div className="fr-px-3w fr-pb-3w">
            <MainContent>
                {!selectedDraftId && (
                    <>
                        <p className="fr-text--sm">
                            Créez et téléchargez facilement des rapports à partir de nos trames pré-remplies, personnalisez-les et retrouvez les à tout moment.
                        </p>

                        <SectionHeader>
                            <SectionTitle>
                                Créer un nouveau rapport
                            </SectionTitle>
                        </SectionHeader>

                        <CardsGrid>
                            <ActionCard
                                icon="fr-icon-bar-chart-box-line"
                                title="Rapport Complet"
                                description="Analyse détaillée de l'évolution de la consommation d'espaces NAF (naturels, agricoles et forestiers) et de l'artificialisation des sols."
                                onClick={() => handleCreateReportOfType('rapport-complet')}
                                disabled={isCreating}
                            />

                            <ActionCard
                                icon="fr-icon-calendar-event-line"
                                title="Rapport Triennal Local"
                                description="Trame pré-remplie du rapport triennal local de suivi de l'artificialisation des sols réalisée en partenariat avec la DGALN."
                                onClick={() => handleCreateReportOfType('rapport-local')}
                                disabled={isCreating}
                            />
                        </CardsGrid>

                        <MyReportsSection>
                            <SectionHeader>
                                <SectionTitle>
                                    <i className="fr-icon-archive-line" aria-hidden="true" />
                                    Mes rapports
                                    <span>({drafts.length})</span>
                                </SectionTitle>
                            </SectionHeader>

                            {isDraftsLoading ? (
                                <EmptyDrafts>
                                    <span className="fr-spinner fr-spinner--sm" aria-hidden="true" />
                                    Chargement...
                                </EmptyDrafts>
                            ) : drafts.length === 0 ? (
                                <EmptyDrafts>
                                    Aucun rapport enregistré. Créez votre premier rapport ci-dessus.
                                </EmptyDrafts>
                            ) : (
                                <CardsGrid>
                                    {drafts.map(draft => (
                                        <ReportCard
                                            key={draft.id}
                                            title={draft.name}
                                            typeLabel={draft.report_type_display}
                                            updatedAt={draft.updated_at}
                                            onClick={() => handleSelectDraft(draft.id)}
                                        />
                                    ))}
                                </CardsGrid>
                            )}
                        </MyReportsSection>
                    </>
                )}

                {selectedDraftId && isDraftLoading && <LoadingState />}

                {selectedDraftId && selectedDraft && !isDraftLoading && (
                    <ReportEditor
                        draft={selectedDraft}
                        landData={landData}
                        content={localContent}
                        saveStatus={saveStatus}
                        lastSavedTime={lastSavedTime}
                        isPdfLoading={isPdfLoading}
                        exportDisabled={exportDisabled}
                        onContentChange={handleContentChange}
                        onBack={handleBack}
                        onExport={handleExportPdf}
                        onRename={handleRenameDraft}
                        onDelete={() => handleDeleteDraft(selectedDraft.id)}
                    />
                )}
            </MainContent>

            <CreateReportModal
                reportType={prefilledReportType}
                isLoading={isCreating}
                onSubmit={handleCreateDraft}
            />
        </div>
    );
};

export default Downloads;
