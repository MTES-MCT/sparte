import React from "react";
import styled from "styled-components";
import { useTrajectoiresContext } from "../context/TrajectoiresContext";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
`;

const ModalTitle = styled.h4`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CustomTargetInput = styled.input`
  width: 120px;
  text-align: center;
`;

export const TrajectoiresCustomTargetModal: React.FC = () => {
  const {
    showCustomTargetModal,
    setShowCustomTargetModal,
    modalTargetInput,
    setModalTargetInput,
    handleSaveCustomTarget,
    isUpdating,
  } = useTrajectoiresContext();

  if (!showCustomTargetModal) return null;

  return (
    <ModalOverlay onClick={() => setShowCustomTargetModal(false)}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Définir un objectif personnalisé</ModalTitle>
        <div className="fr-input-group">
          <label className="fr-label" htmlFor="custom-target-modal">
            Taux de réduction
          </label>
          <div className="d-flex align-items-center gap-2">
            <CustomTargetInput
              id="custom-target-modal"
              type="number"
              min="0"
              max="100"
              step="1"
              value={modalTargetInput}
              onChange={(e) => setModalTargetInput(e.target.value)}
              disabled={isUpdating}
              className="fr-input"
            />
            <span>%</span>
          </div>
          <p className="fr-hint-text">
            Entrez un taux entre 0 et 100 pour simuler un objectif de réduction
            personnalisé.
          </p>
        </div>
        <ModalActions>
          <button
            type="button"
            className="fr-btn fr-btn--tertiary-no-outline"
            onClick={() => setShowCustomTargetModal(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="fr-btn"
            onClick={handleSaveCustomTarget}
            disabled={isUpdating}
          >
            Enregistrer
          </button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};
