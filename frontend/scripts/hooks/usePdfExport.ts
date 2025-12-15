import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/store';
import { useStartExportPdfMutation } from '@services/api';
import { setPdfExportLoading, setPdfExportSuccess, setPdfExportError, resetPdfExport } from '@store/pdfExportSlice';

interface LandData {
    land_id: string;
    land_type: string;
    name: string;
}

/**
 * Hook pour lancer et suivre l'export PDF d'un diagnostic.
 * Lance automatiquement l'export quand landData est disponible.
 */
const usePdfExport = (landData: LandData | undefined) => {
    const dispatch = useDispatch<AppDispatch>();
    const [startExportPdf] = useStartExportPdfMutation();

    useEffect(() => {
        if (!landData) return;

        let intervalId: ReturnType<typeof setInterval> | undefined;
        let done = false;

        const poll = async (jobId: string) => {
            if (done) return;
            try {
                const res = await fetch(`/project/export/status/${jobId}/`, { credentials: 'include' });
                if (done) return;

                if (res.headers.get('content-type')?.includes('application/pdf')) {
                    done = true;
                    clearInterval(intervalId);
                    const blob = await res.blob();
                    dispatch(setPdfExportSuccess({
                        blobUrl: URL.createObjectURL(blob),
                        landInfo: { name: landData.name, landId: landData.land_id },
                        fileSize: blob.size,
                    }));
                } else if (res.status === 404) {
                    done = true;
                    clearInterval(intervalId);
                    const pdfRes = await fetch(`/project/export/pdf/${jobId}/`, { credentials: 'include' });
                    if (pdfRes.ok) {
                        const blob = await pdfRes.blob();
                        dispatch(setPdfExportSuccess({
                            blobUrl: URL.createObjectURL(blob),
                            landInfo: { name: landData.name, landId: landData.land_id },
                            fileSize: blob.size,
                        }));
                    }
                } else {
                    const { status, error } = await res.json();
                    if (status === 'failed') {
                        done = true;
                        clearInterval(intervalId);
                        dispatch(setPdfExportError(error || 'Erreur export'));
                    }
                }
            } catch {
                // Ignorer les erreurs réseau
            }
        };

        dispatch(setPdfExportLoading());
        startExportPdf({
            url: `/exports/rapport-complet/${landData.land_type}/${landData.land_id}`,
            headerUrl: `/exports/pdf-header`,
            footerUrl: `/exports/pdf-footer`,
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
