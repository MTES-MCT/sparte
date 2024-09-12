import React from 'react';
import styled from 'styled-components';

const NoticeContainer = styled.div`
   margin: 2rem 1rem;
`;

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;

interface OcsgeStatusProps {
    status: "COMPLETE_NOT_UNIFORM" | "PARTIAL" | "NO_DATA" | "UNDEFINED";
}

const defaultMessage = "Les données OCS GE ne sont pas encore disponibles sur ce territoire pour les dates sélectionnées.";
const detailMessage = "Vous n'avez donc pas accès aux informations relatives à l'artificialisation, l'imperméabilisation, l'usage et la couverture.";
const errorMessage = `${defaultMessage} ${detailMessage}`;

const statusMessages: { [key in OcsgeStatusProps['status']]?: string } = {
    COMPLETE_NOT_UNIFORM: `Les données OCS GE sont disponibles sur ce territoire, mais les dates des millésimes ne sont pas uniformes entre toutes les collectivités. ${detailMessage}`,
    PARTIAL: `Les données OCS GE ne sont que partiellement disponibles sur ce territoire. ${detailMessage}`,
    NO_DATA: errorMessage,
    UNDEFINED: errorMessage,
};

const OcsgeStatus: React.FC<OcsgeStatusProps> = ({ status }) => {
    const message = statusMessages[status] || errorMessage;
    return (
        <NoticeContainer className="fr-notice fr-notice--info">
            <div className="fr-container">
                <NoticeBody className="fr-notice__body">
                    <p className="fr-notice__title">Données OCS GE non disponibles.</p>
                    <p className="fr-notice__desc fr-text--sm">{ message }</p>
                </NoticeBody>
            </div>
        </NoticeContainer>
    );
};

export default OcsgeStatus;
