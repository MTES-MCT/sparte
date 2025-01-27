import React from "react";
import styled from "styled-components";

const NoticeBody = styled.div`
  flex-direction: column;
  display: flex;
  gap: 0.5rem;
`;

const GpuStatus: React.FC = () => {
  return (
    <div className="fr-notice fr-notice--info fr-my-3w">
      <div className="fr-container--fluid fr-p-3w">
        <NoticeBody className="fr-notice__body">
          <p className="fr-notice__title">
            Données de zonages d'urbanisme non disponibles.
          </p>
          <p className="fr-notice__desc fr-text--sm">
            Les données de zonages d'urbanisme issus du GPU (Géoportail de
            l'Urbanisme) ne sont pas disponibles sur ce territoire.
          </p>
        </NoticeBody>
      </div>
    </div>
  );
};

export default GpuStatus;
