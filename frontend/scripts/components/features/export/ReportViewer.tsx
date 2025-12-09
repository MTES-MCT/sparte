import React from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import { ReportDraft } from '@services/types/reportDraft';
import { EditableRapportComplet, EditableRapportLocal } from '@components/report';
import DraftTopBar from './DraftTopBar';
import EmptyState from './EmptyState';

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
}) => {
    const renderReportContent = () => {
        if (draft.report_type === 'rapport-complet') {
            return (
                <EditableRapportComplet
                    landData={landData}
                    content={content}
                    onContentChange={onContentChange}
                />
            );
        }

        if (draft.report_type === 'rapport-local') {
            return (
                <EditableRapportLocal
                    landData={landData}
                    content={content}
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

