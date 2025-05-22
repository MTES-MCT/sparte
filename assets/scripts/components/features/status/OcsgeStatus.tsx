import React from 'react';
import styled from 'styled-components';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;

export enum OcsgeStatusEnum {
    COMPLETE_UNIFORM = "COMPLETE_UNIFORM",
    COMPLETE_NOT_UNIFORM = "COMPLETE_NOT_UNIFORM",
    PARTIAL = "PARTIAL",
    NO_DATA = "NO_DATA",
    UNDEFINED = "UNDEFINED",
}

export interface OcsgeStatusProps {
    status: OcsgeStatusEnum;
}

const defaultMessage = "Les données OCS GE ne sont pas encore disponibles sur ce territoire.";
const detailMessage = "Vous n'avez donc pas accès aux informations relatives à l'artificialisation.";
const errorMessage = `${defaultMessage} ${detailMessage}`;

const statusMessages: { [key in OcsgeStatusEnum]?: string } = {
    COMPLETE_NOT_UNIFORM: `Les données OCS GE sont disponibles sur ce territoire, mais les dates des millésimes ne sont pas uniformes entre toutes les collectivités.`,
    PARTIAL: `Les données OCS GE ne sont que partiellement disponibles sur ce territoire. ${detailMessage}`,
    NO_DATA: errorMessage,
    UNDEFINED: errorMessage,
};

const titleMessages: { [key in OcsgeStatusEnum]?: string } = {
    COMPLETE_NOT_UNIFORM: "Données OCS GE disponibles mais non uniformes",
    PARTIAL: "Données OCS GE partiellement disponibles",
    NO_DATA: "Données OCS GE non disponibles",
    UNDEFINED: "Données OCS GE non disponibles",
};

const OcsgeStatus: React.FC<OcsgeStatusProps> = ({ status }) => {
    const message = statusMessages[status]
    const title = titleMessages[status]
    return (
        <div className="fr-notice fr-notice--info fr-my-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body flex-column">
                    <p className="fr-notice__title">{ title }</p>
                    <p className="fr-notice__desc fr-text--sm">{ message }</p>
                </NoticeBody>
            </div>
        </div>
    );
};

export default OcsgeStatus;
