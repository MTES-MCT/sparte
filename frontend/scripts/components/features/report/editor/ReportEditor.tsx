import React, { useState } from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import { ReportDraft } from '@services/types/reportDraft';
import { RapportComplet } from '../templates';
import { RapportLocal } from '../templates';
import EditorTopBar from './EditorTopBar';
import { EmptyState } from '../list';

interface ReportEditorProps {
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

const ReportEditor: React.FC<ReportEditorProps> = ({
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const renderReportContent = () => {
        if (draft.report_type === 'rapport-complet') {
            return (
                <RapportComplet
                    landData={landData}
                    content={content}
                    mode="edit"
                    projectId={draft.project}
                    onContentChange={onContentChange}
                    isSettingsOpen={isSettingsOpen}
                    onSettingsChange={setIsSettingsOpen}
                />
            );
        }

        if (draft.report_type === 'rapport-local') {
            return (
                <RapportLocal
                    landData={landData}
                    content={content}
                    mode="edit"
                    projectId={draft.project}
                    onContentChange={onContentChange}
                    isSettingsOpen={isSettingsOpen}
                    onSettingsChange={setIsSettingsOpen}
                />
            );
        }

        return null;
    };

    return (
        <>
            <EditorTopBar
                name={draft.name}
                typeLabel={draft.report_type_display}
                saveStatus={saveStatus}
                lastSavedTime={lastSavedTime}
                isPdfLoading={isPdfLoading}
                onBack={onBack}
                onExport={onExport}
                onRename={onRename}
                onDelete={onDelete}
                onSettingsClick={() => setIsSettingsOpen(true)}
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

export default ReportEditor;

