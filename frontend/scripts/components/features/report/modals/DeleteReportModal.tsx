import React from 'react';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import styled from 'styled-components';

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const modal = createModal({
    id: "delete-report-modal",
    isOpenedByDefault: false,
});

interface DeleteReportModalProps {
    onConfirm: () => void;
}

const DeleteReportModal: React.FC<DeleteReportModalProps> = ({ onConfirm }) => {
    const handleConfirm = () => {
        modal.close();
        onConfirm();
    };

    return (
        <modal.Component
            title="Supprimer ce rapport ?"
            size="small"
        >
            <p>Cette action est irréversible. Le rapport et tout son contenu seront définitivement supprimés.</p>
            <ButtonGroup>
                <Button
                    priority="secondary"
                    onClick={() => modal.close()}
                >
                    Annuler
                </Button>
                <Button
                    priority="primary"
                    onClick={handleConfirm}
                >
                    Supprimer
                </Button>
            </ButtonGroup>
        </modal.Component>
    );
};

export const useDeleteReportModal = () => modal;

export default DeleteReportModal;
