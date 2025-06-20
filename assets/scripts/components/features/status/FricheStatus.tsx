import React from 'react';
import styled from 'styled-components';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;


const FricheStatus: React.FC = () => {
    return (
        <div className="fr-notice fr-notice--info fr-my-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body flex-column">
                    <p className="fr-notice__title">Données de friches non disponibles.</p>
                    <p className="fr-notice__desc fr-text--sm">Les données de friches issues des données Cartofriches ne sont pas disponibles sur ce territoire.</p>
                </NoticeBody>
            </div>
        </div>
    );
};

export default FricheStatus;
