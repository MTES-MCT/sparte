import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LandInfo {
    name: string;
    landId: string;
}

export interface PdfExportState {
    jobId: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    landInfo: LandInfo | null;
}

const initialState: PdfExportState = {
    jobId: null,
    status: 'idle',
    error: null,
    landInfo: null,
};

interface FetchPdfParams {
    exportServerUrl: string;
    pdfHeaderUrl: string;
    pdfFooterUrl: string;
    landType: string;
    landId: string;
    landName: string;
}

interface FetchDraftPdfParams {
    exportServerUrl: string;
    pdfHeaderUrl: string;
    pdfFooterUrl: string;
    draftId: string;
    draftName: string;
}

export const fetchPdfExport = createAsyncThunk(
    'pdfExport/fetchPdf',
    async (params: FetchPdfParams, { rejectWithValue }) => {
        const { exportServerUrl, pdfHeaderUrl, pdfFooterUrl, landType, landId, landName } = params;

        const pageUrl = `${globalThis.location.origin}/exports/rapport-complet/${landType}/${landId}`;
        const exportUrl = `${exportServerUrl}/api/export` +
            `?url=${encodeURIComponent(pageUrl)}` +
            `&headerUrl=${encodeURIComponent(pdfHeaderUrl)}` +
            `&footerUrl=${encodeURIComponent(pdfFooterUrl)}`;

        try {
            const response = await fetch(exportUrl);

            if (!response.ok) {
                throw new Error(`Erreur lors de la génération du PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const fileSize = blob.size;

            return { blobUrl, landInfo: { name: landName, landId }, fileSize };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
        }
    }
);

export const fetchDraftPdfExport = createAsyncThunk(
    'pdfExport/fetchDraftPdf',
    async (params: FetchDraftPdfParams, { rejectWithValue }) => {
        const { exportServerUrl, pdfHeaderUrl, pdfFooterUrl, draftId, draftName } = params;

        const pageUrl = `${globalThis.location.origin}/exports/rapport-draft/${draftId}`;
        const exportUrl = `${exportServerUrl}/api/export` +
            `?url=${encodeURIComponent(pageUrl)}` +
            `&headerUrl=${encodeURIComponent(pdfHeaderUrl)}` +
            `&footerUrl=${encodeURIComponent(pdfFooterUrl)}`;

        try {
            const response = await fetch(exportUrl);

            if (!response.ok) {
                throw new Error(`Erreur lors de la génération du PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const fileSize = blob.size;

            return { blobUrl, landInfo: { name: draftName, landId: String(draftId) }, fileSize };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
        }
    }
);

const pdfExportSlice = createSlice({
    name: 'pdfExport',
    initialState,
    reducers: {
        resetPdfExport: (state) => {
            state.jobId = null;
            state.status = 'idle';
            state.error = null;
            state.landInfo = null;
        },
        setPdfExportLoading: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        setPdfExportSuccess: (state, action: PayloadAction<{ jobId: string; landInfo: LandInfo }>) => {
            state.status = 'succeeded';
            state.jobId = action.payload.jobId;
            state.landInfo = action.payload.landInfo;
        },
        setPdfExportError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPdfExport.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPdfExport.fulfilled, (state, action: PayloadAction<{ blobUrl: string; landInfo: LandInfo; fileSize: number }>) => {
                state.status = 'succeeded';
                state.blobUrl = action.payload.blobUrl;
                state.landInfo = action.payload.landInfo;
                state.fileSize = action.payload.fileSize;
            })
            .addCase(fetchPdfExport.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchDraftPdfExport.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDraftPdfExport.fulfilled, (state, action: PayloadAction<{ blobUrl: string; landInfo: LandInfo; fileSize: number }>) => {
                state.status = 'succeeded';
                state.blobUrl = action.payload.blobUrl;
                state.landInfo = action.payload.landInfo;
                state.fileSize = action.payload.fileSize;
            })
            .addCase(fetchDraftPdfExport.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { resetPdfExport, setPdfExportLoading, setPdfExportSuccess, setPdfExportError } = pdfExportSlice.actions;

export const selectPdfExportStatus = (state: { pdfExport: PdfExportState }) => state.pdfExport.status;
export const selectPdfExportJobId = (state: { pdfExport: PdfExportState }) => state.pdfExport.jobId;
export const selectPdfExportError = (state: { pdfExport: PdfExportState }) => state.pdfExport.error;
export const selectPdfExportLandInfo = (state: { pdfExport: PdfExportState }) => state.pdfExport.landInfo;

export default pdfExportSlice.reducer;
