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


const GpuStatus: React.FC = () => {
    return (
        <NoticeContainer className="fr-notice fr-notice--info">
            <div className="fr-container">
                <NoticeBody className="fr-notice__body">
                    <p className="fr-notice__title">Données de zonages d'urbanisme non disponibles.</p>
                    <p className="fr-notice__desc fr-text--sm">Les données de zonages d'urbanisme issus du GPU (Géoportail de l'Urbanisme) ne sont pas disponibles sur ce territoire.</p>
                </NoticeBody>
            </div>
        </NoticeContainer>
    );
};

export default GpuStatus;
