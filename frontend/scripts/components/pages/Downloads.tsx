import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RootState, AppDispatch } from '@store/store';
import {
    selectPdfExportStatus,
    selectPdfExportBlobUrl,
    fetchDraftPdfExport,
    resetPdfExport,
} from '@store/pdfExportSlice';
import {
    useGetReportDraftsQuery,
    useGetReportDraftQuery,
    useGetReportTypesQuery,
    useCreateReportDraftMutation,
    useUpdateReportDraftMutation,
    useDeleteReportDraftMutation,
    useRecordDownloadRequestMutation,
    useGetEnvironmentQuery,
} from '@services/api';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import { ReportDraftListItem, ReportType } from '@services/types/reportDraft';
import { DraftList, CreateReportForm, EditableRapportComplet, EditableRapportLocal } from '@components/report';
import Drawer from '@components/ui/Drawer';
import ActionCard from '@components/ui/ActionCard';

const MainContent = styled.main`
    width: 100%;
`;

const ReportWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px 24px;
    background: white;
    border-radius: 0.25rem;
    box-shadow: var(--lifted);
    position: sticky;
    top: 24px;
    z-index: 100;
    width: 100%;
`;

const TopBarLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const TopBarCenter = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 0 16px;
`;

const DraftName = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const DraftType = styled.span`
    margin-top: 4px;
    padding: 4px 12px;
    background: #e3e3fd;
    color: #000091;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    display: inline-block;
    width: fit-content;
`;

const TopBarRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SaveStatus = styled.div<{ $status: 'saved' | 'saving' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${props => {
        switch (props.$status) {
            case 'saved': return '#18753c';
            case 'saving': return '#666';
            case 'error': return '#ce0500';
        }
    }};
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    padding: 48px;
`;

const EmptyStateIcon = styled.div`
    font-size: 72px;
    opacity: 0.2;
    margin-bottom: 24px;
`;

const EmptyStateTitle = styled.h2`
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
`;

const EmptyStateText = styled.p`
    margin: 0 0 24px 0;
    color: #666;
    max-width: 400px;
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

const LoginPrompt = styled.div`
    background: white;
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    max-width: 500px;
    margin: 48px auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ReportContainer = styled.div`
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
`;

const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    padding: 32px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const AUTOSAVE_DELAY = 2000;

interface DownloadsProps {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

const sanitizeFilename = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
};

const Downloads: React.FC<DownloadsProps> = ({ landData, projectData }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { draftId: urlDraftId } = useParams<{ draftId?: string }>();
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(urlDraftId || null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [localContent, setLocalContent] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<Record<string, string>>({});

    const isAuthenticated = projectData.header.menuItems.some(
        item => item.label === 'Mon compte' && item.shouldDisplay
    );

    const pdfStatus = useSelector((state: RootState) => selectPdfExportStatus(state));
    const pdfBlobUrl = useSelector((state: RootState) => selectPdfExportBlobUrl(state));
    const { data: environment } = useGetEnvironmentQuery(undefined);

    const { data: drafts = [], isLoading: isDraftsLoading } = useGetReportDraftsQuery(
        { projectId: projectData.id },
        { skip: !isAuthenticated }
    );

    const { data: selectedDraft, isLoading: isDraftLoading, error: draftError } = useGetReportDraftQuery(
        selectedDraftId!,
        { skip: !selectedDraftId }
    );

    const { data: reportTypes = [] } = useGetReportTypesQuery(undefined, {
        skip: !isAuthenticated,
    });

    const [createDraft, { isLoading: isCreating }] = useCreateReportDraftMutation();
    const [updateDraft] = useUpdateReportDraftMutation();
    const [deleteDraft] = useDeleteReportDraftMutation();
    const [recordDownload] = useRecordDownloadRequestMutation();

    useEffect(() => {
        setSelectedDraftId(urlDraftId || null);
        if (!urlDraftId) {
            setLocalContent({});
            lastSavedRef.current = {};
            setSaveStatus('saved');
        }
    }, [urlDraftId]);

    useEffect(() => {
        if (draftError && selectedDraftId) {
            navigate(projectData.urls.downloads, { replace: true });
        }
    }, [draftError, selectedDraftId, navigate, projectData.urls.downloads]);

    useEffect(() => {
        if (selectedDraft) {
            setLocalContent(selectedDraft.content || {});
            lastSavedRef.current = selectedDraft.content || {};
            setSaveStatus('saved');
        }
    }, [selectedDraft]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const performSave = useCallback(async (content: Record<string, string>) => {
        if (!selectedDraftId) return;
        if (JSON.stringify(content) === JSON.stringify(lastSavedRef.current)) return;

        setSaveStatus('saving');
        try {
            await updateDraft({ id: selectedDraftId, content });
            lastSavedRef.current = content;
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        }
    }, [selectedDraftId, updateDraft]);

    const scheduleSave = useCallback((content: Record<string, string>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            performSave(content);
        }, AUTOSAVE_DELAY);
    }, [performSave]);

    const handleContentChange = useCallback((key: string, value: string) => {
        const newContent = { ...localContent, [key]: value };
        setLocalContent(newContent);
        scheduleSave(newContent);
    }, [localContent, scheduleSave]);

    const handleSelectDraft = useCallback((draft: ReportDraftListItem) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            performSave(localContent);
        }
        navigate(`${projectData.urls.downloads}/${draft.id}`);
        setShowDrawer(false);
    }, [localContent, performSave, navigate, projectData.urls.downloads]);

    const handleDeleteDraft = useCallback(async (draftIdToDelete: string) => {
        await deleteDraft(draftIdToDelete);
        if (selectedDraftId === draftIdToDelete) {
            navigate(projectData.urls.downloads, { replace: true });
            setLocalContent({});
        }
    }, [deleteDraft, selectedDraftId, navigate, projectData.urls.downloads]);

    const handleCreateDraft = useCallback(async (data: { name: string; reportType: ReportType }) => {
        const result = await createDraft({
            project: projectData.id,
            report_type: data.reportType,
            name: data.name,
            content: {},
        });

        if ('data' in result) {
            navigate(`${projectData.urls.downloads}/${result.data.id}`);
            setShowCreateModal(false);
        }
    }, [createDraft, projectData.id, navigate, projectData.urls.downloads]);

    const handleCreateReportOfType = useCallback((reportType: ReportType) => {
        const reportNames = {
            'rapport-complet': 'Rapport Complet',
            'rapport-local': 'Rapport Triennal Local',
        };

        const timestamp = new Date().toLocaleDateString('fr-FR');
        const defaultName = `${reportNames[reportType]} - ${timestamp}`;

        createDraft({
            project: projectData.id,
            report_type: reportType,
            name: defaultName,
            content: {},
        }).then((result) => {
            if ('data' in result) {
                navigate(`${projectData.urls.downloads}/${result.data.id}`);
            }
        });
    }, [createDraft, projectData.id, navigate, projectData.urls.downloads]);

    const handleExportPdf = useCallback(async () => {
        if (!selectedDraft || !environment) return;

        dispatch(resetPdfExport());

        const result = await dispatch(fetchDraftPdfExport({
            exportServerUrl: environment.export_server_url,
            pdfHeaderUrl: `${globalThis.location.origin}/exports/pdf-header`,
            pdfFooterUrl: `${globalThis.location.origin}/exports/pdf-footer`,
            draftId: selectedDraft.id,
            draftName: selectedDraft.name,
        })).unwrap();

        await recordDownload({
            projectId: projectData.id,
            documentType: selectedDraft.report_type,
            draftId: selectedDraft.id,
        });

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizeFilename(selectedDraft.name)}_${timestamp}.pdf`;

        const link = document.createElement('a');
        link.href = result.blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, [selectedDraft, environment, dispatch, recordDownload, projectData.id]);

    const isPdfLoading = pdfStatus === 'loading';

    if (!isAuthenticated) {
        return (
            <LoginPrompt>
                <EmptyStateIcon>📄</EmptyStateIcon>
                <EmptyStateTitle>Rapports personnalisables</EmptyStateTitle>
                <EmptyStateText>
                    Connectez-vous pour créer des rapports personnalisés avec vos propres commentaires et analyses.
                </EmptyStateText>
                <a href="/users/signin/" className="fr-btn">
                    Se connecter
                </a>
            </LoginPrompt>
        );
    }

    const renderReportContent = () => {
        if (!selectedDraft) return null;

        if (selectedDraft.report_type === 'rapport-complet') {
            return (
                <EditableRapportComplet
                    landData={landData}
                    content={localContent}
                    onContentChange={handleContentChange}
                />
            );
        }

        if (selectedDraft.report_type === 'rapport-local') {
            return (
                <EditableRapportLocal
                    landData={landData}
                    content={localContent}
                    onContentChange={handleContentChange}
                />
            );
        }

        return null;
    };

    return (
        <div className="fr-container--fluid fr-px-3w fr-pb-3w">
            <p className="fr-text--sm">
                Créez et téléchargez facilement des rapports à partir de nos trames pré-remplies, personnalisez-les et retrouvez les à tout moment.
            </p>

            <MainContent>
                {!selectedDraftId && (
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

                        <ActionCard
                            icon="fr-icon-archive-line"
                            title={`Mes Rapports (${drafts.length})`}
                            description="Retrouvez vos rapports personnalisés. Tous vos commentaires et analyses sont conservés."
                            onClick={() => setShowDrawer(true)}
                            disabled={drafts.length === 0}
                        />
                    </CardsGrid>
                )}

                {selectedDraftId && isDraftLoading && (
                    <EmptyState>
                        <span className="fr-spinner" aria-hidden="true" />
                        <p>Chargement du rapport...</p>
                    </EmptyState>
                )}

                {selectedDraftId && selectedDraft && !isDraftLoading && (
                    <ReportWrapper>
                        <TopBar>
                            <TopBarLeft>
                                <button 
                                    className="fr-btn fr-btn--tertiary fr-btn--icon-left"
                                    onClick={() => setShowDrawer(true)}
                                    title="Mes rapports"
                                >
                                    <i className="bi bi-folder" />
                                </button>
                            </TopBarLeft>
                            <TopBarCenter>
                                <DraftName>{selectedDraft.name}</DraftName>
                                <DraftType>{selectedDraft.report_type_display}</DraftType>
                            </TopBarCenter>
                            <TopBarRight>
                                <SaveStatus $status={saveStatus}>
                                    {saveStatus === 'saving' && (
                                        <>
                                            <span className="fr-spinner fr-spinner--sm" aria-hidden="true" />
                                            Enregistrement...
                                        </>
                                    )}
                                    {saveStatus === 'saved' && (
                                        <>
                                            <i className="bi bi-check-circle-fill" />
                                            Enregistré
                                        </>
                                    )}
                                    {saveStatus === 'error' && (
                                        <>
                                            <i className="bi bi-exclamation-circle-fill" />
                                            Erreur
                                        </>
                                    )}
                                </SaveStatus>
                                <button
                                    className="fr-btn"
                                    onClick={handleExportPdf}
                                    disabled={isPdfLoading || !environment}
                                >
                                    {isPdfLoading ? (
                                        <>
                                            <span className="fr-spinner fr-spinner--sm fr-mr-1w" aria-hidden="true" />
                                            Export...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-pdf fr-mr-1w" />
                                            Télécharger PDF
                                        </>
                                    )}
                                </button>
                            </TopBarRight>
                        </TopBar>

                        <ReportContainer>
                            {renderReportContent()}
                        </ReportContainer>
                    </ReportWrapper>
                )}
            </MainContent>

            <Drawer
                isOpen={showDrawer}
                title="Mes rapports"
                onClose={() => setShowDrawer(false)}
            >
                <div style={{ marginBottom: '16px' }}>
                    <button
                        className="fr-btn fr-btn--secondary"
                        onClick={() => {
                            setShowDrawer(false);
                            setShowCreateModal(true);
                        }}
                        style={{ width: '100%' }}
                    >
                        <i className="bi bi-plus-lg fr-mr-1w" />
                        Nouveau rapport
                    </button>
                </div>
                <DraftList
                    drafts={drafts}
                    selectedDraftId={selectedDraftId ?? undefined}
                    onSelect={handleSelectDraft}
                    onDelete={handleDeleteDraft}
                    isLoading={isDraftsLoading}
                />
            </Drawer>

            {showCreateModal && (
                <Modal onClick={() => setShowCreateModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Créer un nouveau rapport</ModalTitle>
                        <CreateReportForm
                            reportTypes={reportTypes}
                            onSubmit={handleCreateDraft}
                            onCancel={() => setShowCreateModal(false)}
                            isLoading={isCreating}
                        />
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
};

export default Downloads;
