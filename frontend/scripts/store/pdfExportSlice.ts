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
});

export const { resetPdfExport, setPdfExportLoading, setPdfExportSuccess, setPdfExportError } = pdfExportSlice.actions;

export const selectPdfExportStatus = (state: { pdfExport: PdfExportState }) => state.pdfExport.status;
export const selectPdfExportJobId = (state: { pdfExport: PdfExportState }) => state.pdfExport.jobId;
export const selectPdfExportError = (state: { pdfExport: PdfExportState }) => state.pdfExport.error;
export const selectPdfExportLandInfo = (state: { pdfExport: PdfExportState }) => state.pdfExport.landInfo;

export default pdfExportSlice.reducer;
