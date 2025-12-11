import React from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import { ReportDraft } from '@services/types/reportDraft';
import { RapportComplet } from '../templates';
import { RapportLocal } from '../templates';
import DraftTopBar from './DraftTopBar';
import { EmptyState } from '../ui';

interface ReportViewerProps {
    draft: ReportDraft;
    landData: LandDetailResultType;
    content: Record<string, string>;
    saveStatus: 'saved' | 'saving' | 'error';
    lastSavedTime: Date | null;
    isPdfLoading: boolean;
    exportDisabled: boolean;
    onContentChange: (key: string, value: string) => void;
    onBack: () => void;
    onExport: () => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
}

const ReportWrapper = styled.div`
    max-width: 1400px;
    margin: 2rem auto;
    width: 100%;
`;

const ReportContainer = styled.div`
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
`;

const ReportViewer: React.FC<ReportViewerProps> = ({
    draft,
    landData,
    content,
    saveStatus,
    lastSavedTime,
    isPdfLoading,
    exportDisabled,
    onContentChange,
    onBack,
    onExport,
    onRename,
    onDelete,
}) => {
    const renderReportContent = () => {
        if (draft.report_type === 'rapport-complet') {
            return (
                <RapportComplet
                    landData={landData}
                    content={content}
                    mode="edit"
                    onContentChange={onContentChange}
                />
            );
        }

        if (draft.report_type === 'rapport-local') {
            return (
                <RapportLocal
                    landData={landData}
                    content={content}
                    mode="edit"
                    onContentChange={onContentChange}
                />
            );
        }

        return null;
    };

    return (
        <>
            <DraftTopBar
                name={draft.name}
                typeLabel={draft.report_type_display}
                saveStatus={saveStatus}
                lastSavedTime={lastSavedTime}
                isPdfLoading={isPdfLoading}
                onBack={onBack}
                onExport={onExport}
                onRename={onRename}
                onDelete={onDelete}
                exportDisabled={exportDisabled}
            />

            <ReportWrapper>
                <ReportContainer>
                    {renderReportContent()}
                </ReportContainer>
            </ReportWrapper>
        </>
    );
};

export const LoadingState: React.FC = () => (
    <EmptyState title="Chargement du rapport...">
        <span className="fr-spinner" aria-hidden="true" />
    </EmptyState>
);

export default ReportViewer;
