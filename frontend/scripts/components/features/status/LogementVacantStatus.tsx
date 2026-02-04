import React from 'react';
import styled from 'styled-components';
import { LogementVacantStatusEnum } from '@services/types/land';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;

interface LogementVacantStatusProps {
    status?: LogementVacantStatusEnum;
}

const LogementVacantStatus: React.FC<LogementVacantStatusProps> = ({ status }) => {
    const isPartiallySecretised = status?.includes('secretise');

    if (isPartiallySecretised) {
        return (
            <div className="fr-notice fr-notice--info fr-my-3w">
                <div className="fr-container--fluid fr-p-3w">
                    <NoticeBody className="fr-notice__body flex-column">
                        <p className="fr-notice__title">Données partiellement indisponibles.</p>
                        <p className="fr-notice__desc fr-text--sm">
                            Les données du parc privé sont partiellement indisponibles en raison du secret statistique.
                        </p>
                    </NoticeBody>
                </div>
            </div>
        );
    }

    return (
        <div className="fr-notice fr-notice--info fr-my-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body flex-column">
                    <p className="fr-notice__title">Données de vacance des logements non disponibles.</p>
                    <p className="fr-notice__desc fr-text--sm">
                        Les données de logements vacants ne sont pas ou partiellement disponibles pour votre territoire.
                        Cela peut être dû à un nombre insuffisant de logements vacants dans le parc privé (moins de 11 logements vacants depuis moins de deux ans et moins de 11 logements vacants depuis deux ans ou plus), ou à d'autres raisons liées à la collecte des données.
                    </p>
                </NoticeBody>
            </div>
        </div>
    );
};

export default LogementVacantStatus;
