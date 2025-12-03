import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface LandInfo {
    name: string;
    landId: string;
}

export interface PdfExportState {
    blobUrl: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    landInfo: LandInfo | null;
    fileSize: number | null;
}

const initialState: PdfExportState = {
    blobUrl: null,
    status: 'idle',
    error: null,
    landInfo: null,
    fileSize: null,
};

interface FetchPdfParams {
    exportServerUrl: string;
    pdfHeaderUrl: string;
    pdfFooterUrl: string;
    landType: string;
    landId: string;
    landName: string;
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

const pdfExportSlice = createSlice({
    name: 'pdfExport',
    initialState,
    reducers: {
        resetPdfExport: (state) => {
            if (state.blobUrl) {
                URL.revokeObjectURL(state.blobUrl);
            }
            state.blobUrl = null;
            state.status = 'idle';
            state.error = null;
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
            });
    },
});

export const { resetPdfExport } = pdfExportSlice.actions;

export const selectPdfExportStatus = (state: { pdfExport: PdfExportState }) => state.pdfExport.status;
export const selectPdfExportBlobUrl = (state: { pdfExport: PdfExportState }) => state.pdfExport.blobUrl;
export const selectPdfExportError = (state: { pdfExport: PdfExportState }) => state.pdfExport.error;
export const selectPdfExportLandInfo = (state: { pdfExport: PdfExportState }) => state.pdfExport.landInfo;
export const selectPdfExportFileSize = (state: { pdfExport: PdfExportState }) => state.pdfExport.fileSize;

export default pdfExportSlice.reducer;
