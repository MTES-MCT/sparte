import React from 'react';
import styled from 'styled-components';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;


const LogementVacantStatus: React.FC = () => {
    return (
        <div className="fr-notice fr-notice--info fr-my-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body">
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
