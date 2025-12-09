import React from 'react';
import styled from 'styled-components';
import { CreateReportForm } from '@components/report';
import { ReportType, ReportTypeOption } from '@services/types/reportDraft';

interface CreateReportModalProps {
    reportTypes: ReportTypeOption[];
    isLoading: boolean;
    onSubmit: (data: { name: string; reportType: ReportType }) => void;
    onClose: () => void;
}

const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    padding: 32px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

const CreateReportModal: React.FC<CreateReportModalProps> = ({
    reportTypes,
    isLoading,
    onSubmit,
    onClose,
}) => {
    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Créer un nouveau rapport</ModalTitle>
                <CreateReportForm
                    reportTypes={reportTypes}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                />
            </ModalContent>
        </Modal>
    );
};

export default CreateReportModal;

