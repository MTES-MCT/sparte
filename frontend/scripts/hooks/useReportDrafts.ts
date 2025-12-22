import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@store/store';
import {
    selectPdfExportStatus,
    resetPdfExport,
    setPdfExportLoading,
    setPdfExportSuccess,
    setPdfExportError,
} from '@store/pdfExportSlice';
import {
    useGetReportDraftsQuery,
    useGetReportDraftQuery,
    useCreateReportDraftMutation,
    useUpdateReportDraftMutation,
    useDeleteReportDraftMutation,
    useStartExportPdfMutation,
    useLazyGetExportStatusQuery,
} from '@services/api';
import { ReportType } from '@services/types/reportDraft';
import { useCreateReportModal } from '@components/features/report';

const AUTOSAVE_DELAY = 100; // Délai minimal car ContentZone gère déjà le debounce

const sanitizeFilename = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
};

interface UseReportDraftsOptions {
    projectId: number;
    downloadsUrl: string;
    isAuthenticated: boolean;
}

export const useReportDrafts = ({ projectId, downloadsUrl, isAuthenticated }: UseReportDraftsOptions) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { draftId: urlDraftId } = useParams<{ draftId?: string }>();
    const createReportModal = useCreateReportModal();

    // Local state
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(urlDraftId || null);
    const [localContent, setLocalContent] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

    // Refs for autosave
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<Record<string, string>>({});
    const localContentRef = useRef<Record<string, string>>({});

    // API queries
    const pdfStatus = useSelector((state: RootState) => selectPdfExportStatus(state));

    const { data: drafts = [], isLoading: isDraftsLoading } = useGetReportDraftsQuery(
        { projectId },
        { skip: !isAuthenticated }
    );

    const { data: selectedDraft, isLoading: isDraftLoading, error: draftError } = useGetReportDraftQuery(
        selectedDraftId!,
        { skip: !selectedDraftId }
    );

    // API mutations
    const [createDraft, { isLoading: isCreating }] = useCreateReportDraftMutation();
    const [updateDraft] = useUpdateReportDraftMutation();
    const [deleteDraft] = useDeleteReportDraftMutation();
    const [startExportPdf] = useStartExportPdfMutation();
    const [getExportStatus] = useLazyGetExportStatusQuery();

    // Sync selectedDraftId with URL
    useEffect(() => {
        setSelectedDraftId(urlDraftId || null);
        dispatch(resetPdfExport());
        if (!urlDraftId) {
            setLocalContent({});
            localContentRef.current = {};
            lastSavedRef.current = {};
            setSaveStatus('saved');
            setLastSavedTime(null);
        }
    }, [urlDraftId, dispatch]);

    // Redirect on draft error
    useEffect(() => {
        if (draftError && selectedDraftId) {
            navigate(downloadsUrl, { replace: true });
        }
    }, [draftError, selectedDraftId, navigate, downloadsUrl]);

    // Sync local content with selected draft
    useEffect(() => {
        if (selectedDraft) {
            const content = selectedDraft.content || {};
            setLocalContent(content);
            localContentRef.current = content;
            lastSavedRef.current = content;
            setSaveStatus('saved');
        }
    }, [selectedDraftId, selectedDraft]);

    // Sauvegarde et cleanup au démontage
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            // Sauvegarde immédiate des changements en attente au démontage
            if (selectedDraftId && JSON.stringify(localContentRef.current) !== JSON.stringify(lastSavedRef.current)) {
                updateDraft({ id: selectedDraftId, content: localContentRef.current });
            }
        };
    }, [selectedDraftId, updateDraft]);

    // Autosave logic
    const performSave = useCallback(async (content: Record<string, string>) => {
        if (!selectedDraftId) return;
        if (JSON.stringify(content) === JSON.stringify(lastSavedRef.current)) return;

        setSaveStatus('saving');
        try {
            await updateDraft({ id: selectedDraftId, content });
            lastSavedRef.current = content;
            setSaveStatus('saved');
            setLastSavedTime(new Date());
        } catch {
            setSaveStatus('error');
        }
    }, [selectedDraftId, updateDraft]);

    // Handlers
    const handleContentChange = useCallback((key: string, value: string) => {
        setLocalContent(prev => {
            const newContent = { ...prev, [key]: value };
            localContentRef.current = newContent;
            return newContent;
        });
        // Schedule save (en dehors du state updater pour éviter les problèmes)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            performSave(localContentRef.current);
        }, AUTOSAVE_DELAY);
    }, [performSave]);

    const handleSelectDraft = useCallback((draftId: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            performSave(localContentRef.current);
        }
        navigate(`${downloadsUrl}/${draftId}`);
    }, [performSave, navigate, downloadsUrl]);

    const handleDeleteDraft = useCallback(async (draftIdToDelete: string) => {
        await deleteDraft(draftIdToDelete);
        if (selectedDraftId === draftIdToDelete) {
            navigate(downloadsUrl, { replace: true });
            setLocalContent({});
        }
    }, [deleteDraft, selectedDraftId, navigate, downloadsUrl]);

    const handleRenameDraft = useCallback(async (newName: string) => {
        if (!selectedDraftId) return;

        setSaveStatus('saving');
        try {
            await updateDraft({ id: selectedDraftId, name: newName });
            setSaveStatus('saved');
            setLastSavedTime(new Date());
        } catch {
            setSaveStatus('error');
        }
    }, [selectedDraftId, updateDraft]);

    const handleCreateDraft = useCallback(async (data: { name: string; reportType: ReportType }) => {
        const result = await createDraft({
            project: projectId,
            report_type: data.reportType,
            name: data.name,
            content: {},
        });

        if ('data' in result) {
            navigate(`${downloadsUrl}/${result.data.id}`);
        }
    }, [createDraft, projectId, navigate, downloadsUrl]);

    // State for prefilling the create modal (default to 'rapport-complet')
    const [prefilledReportType, setPrefilledReportType] = useState<ReportType>('rapport-complet');

    const handleCreateReportOfType = useCallback((reportType: ReportType) => {
        setPrefilledReportType(reportType);
        createReportModal.open();
    }, [createReportModal]);

    const handleExportPdf = useCallback(async () => {
        if (!selectedDraft) return;

        dispatch(resetPdfExport());
        dispatch(setPdfExportLoading());

        try {
            const { jobId } = await startExportPdf({ draftId: selectedDraft.id }).unwrap();

            const pollStatus = async (): Promise<void> => {
                const result = await getExportStatus(jobId).unwrap();

                if (result.status === 'completed') {
                    dispatch(setPdfExportSuccess({
                        jobId,
                        landInfo: { name: selectedDraft.name, landId: selectedDraft.id },
                    }));

                    const response = await fetch(`/project/export/download/${jobId}/?project_id=${projectId}`);
                    if (response.ok) {
                        const blob = await response.blob();
                        const timestamp = new Date().toISOString().slice(0, 10);
                        const filename = `${sanitizeFilename(selectedDraft.name)}_${timestamp}.pdf`;

                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        URL.revokeObjectURL(blobUrl);
                    }
                } else if (result.status === 'failed') {
                    dispatch(setPdfExportError(result.error || 'Erreur lors de la génération du PDF'));
                } else {
                    // status === 'pending', continuer le polling
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    await pollStatus();
                }
            };

            await pollStatus();
        } catch {
            dispatch(setPdfExportError('Erreur lors de la génération du PDF'));
        }
    }, [selectedDraft, dispatch, startExportPdf, getExportStatus, projectId]);

    const handleBack = useCallback(() => {
        navigate(downloadsUrl);
    }, [navigate, downloadsUrl]);

    return {
        // State
        selectedDraftId,
        selectedDraft,
        drafts,
        localContent,
        saveStatus,
        lastSavedTime,
        prefilledReportType,

        // Loading states
        isDraftsLoading,
        isDraftLoading,
        isCreating,
        isPdfLoading: pdfStatus === 'loading',

        // Derived state
        exportDisabled: false,

        // Actions
        handleContentChange,
        handleSelectDraft,
        handleDeleteDraft,
        handleRenameDraft,
        handleCreateDraft,
        handleCreateReportOfType,
        handleExportPdf,
        handleBack,
    };
};

