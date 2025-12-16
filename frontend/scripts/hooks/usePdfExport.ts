import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/store';
import { useStartExportPdfMutation, useLazyGetExportStatusQuery } from '@services/api';
import { setPdfExportLoading, setPdfExportSuccess, setPdfExportError, resetPdfExport } from '@store/pdfExportSlice';

interface LandData {
    land_id: string;
    land_type: string;
    name: string;
}

/**
 * Hook pour lancer la génération du PDF et suivre son statut.
 * Ne télécharge pas le PDF, stocke uniquement le jobId quand terminé.
 */
const usePdfExport = (landData: LandData | undefined) => {
    const dispatch = useDispatch<AppDispatch>();
    const [startExportPdf] = useStartExportPdfMutation();
    const [getExportStatus] = useLazyGetExportStatusQuery();

    useEffect(() => {
        if (!landData) return;

        const { land_id, land_type, name } = landData;

        let intervalId: ReturnType<typeof setInterval> | undefined;
        let done = false;

        const poll = async (jobId: string) => {
            if (done) return;
            try {
                const result = await getExportStatus(jobId).unwrap();
                if (done) return;

                const { status, error } = result;

                if (status === 'completed') {
                    done = true;
                    clearInterval(intervalId);
                    dispatch(setPdfExportSuccess({
                        jobId,
                        landInfo: { name, landId: land_id },
                    }));
                } else if (status === 'failed') {
                    done = true;
                    clearInterval(intervalId);
                    dispatch(setPdfExportError(error || 'Erreur export'));
                }
                // Si status === 'pending', on continue le polling
            } catch {
                // Ignorer les erreurs réseau
            }
        };

        dispatch(setPdfExportLoading());
        startExportPdf({
            land_type,
            land_id,
            report_type: 'rapport-complet',
        }).unwrap().then(({ jobId }) => {
            if (done) return;
            poll(jobId);
            intervalId = setInterval(() => poll(jobId), 1000);
        }).catch(() => {
            !done && dispatch(setPdfExportError('Erreur export'));
        });

        return () => {
            done = true;
            clearInterval(intervalId);
            dispatch(resetPdfExport());
        };
    }, [landData?.land_id]);
};

export default usePdfExport;
