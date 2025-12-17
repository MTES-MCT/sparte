import React from 'react';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import CreateReportForm from './CreateReportForm';

import { ReportType } from '@services/types/reportDraft';
import { LandDetailResultType } from '@services/types/land';

interface CreateReportModalProps {
    reportType: ReportType;
    isLoading: boolean;
    onSubmit: (data: { name: string; reportType: ReportType }) => void;
    landData: LandDetailResultType;
}

const modal = createModal({
    id: "create-report-modal",
    isOpenedByDefault: false,
});

const CreateReportModal: React.FC<CreateReportModalProps> = ({
    reportType,
    isLoading,
    onSubmit,
    landData,
}) => {
    const isOpen = useIsModalOpen(modal);

    const handleSubmit = (data: { name: string; reportType: ReportType }) => {
        onSubmit(data);
        modal.close();
    };

    // Ne rendre le formulaire que quand le modal est ouvert
    // pour éviter les problèmes de DOM nesting
    return (
        <modal.Component
            title="Créer un nouveau rapport"
            size="medium"
        >
            {isOpen && (
                <CreateReportForm
                    reportType={reportType}
                    onSubmit={handleSubmit}
                    onCancel={() => modal.close()}
                    isLoading={isLoading}
                    landData={landData}
                />
            )}
        </modal.Component>
    );
};

export const useCreateReportModal = () => modal;

export default CreateReportModal;
