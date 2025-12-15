import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
            state.landInfo = null;
            state.fileSize = null;
        },
        setPdfExportLoading: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        setPdfExportSuccess: (state, action: PayloadAction<{ blobUrl: string; landInfo: LandInfo; fileSize: number }>) => {
            state.status = 'succeeded';
            state.blobUrl = action.payload.blobUrl;
            state.landInfo = action.payload.landInfo;
            state.fileSize = action.payload.fileSize;
        },
        setPdfExportError: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { resetPdfExport, setPdfExportLoading, setPdfExportSuccess, setPdfExportError } = pdfExportSlice.actions;

export const selectPdfExportStatus = (state: { pdfExport: PdfExportState }) => state.pdfExport.status;
export const selectPdfExportBlobUrl = (state: { pdfExport: PdfExportState }) => state.pdfExport.blobUrl;
export const selectPdfExportError = (state: { pdfExport: PdfExportState }) => state.pdfExport.error;
export const selectPdfExportLandInfo = (state: { pdfExport: PdfExportState }) => state.pdfExport.landInfo;
export const selectPdfExportFileSize = (state: { pdfExport: PdfExportState }) => state.pdfExport.fileSize;

export default pdfExportSlice.reducer;
