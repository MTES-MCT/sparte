import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface TargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTarget: number | null;
    onSubmit: (newTarget: number) => void;
    isLoading?: boolean;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 1rem;
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    color: #666;
    line-height: 1;
    
    &:hover {
        color: #000;
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
`;

const InputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
        outline: none;
        border-color: var(--artwork-major-blue-france, #0063cb);
        box-shadow: 0 0 0 3px rgba(0, 99, 203, 0.1);
    }
`;

const PercentSymbol = styled.span`
    font-weight: 500;
    color: #666;
`;

const HelpText = styled.p`
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0;
`;

const InfoBox = styled.div`
    background: #f6f6f6;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
`;

const InfoText = styled.p`
    margin: 0;
    font-size: 0.875rem;
    color: #333;
`;

const ModalFooter = styled.div`
    padding: 1.5rem;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    
    ${({ $variant }) =>
        $variant === 'primary'
            ? `
        background: var(--artwork-major-blue-france, #0063cb);
        color: white;
        
        &:hover:not(:disabled) {
            background: #004ea8;
        }
        
        &:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    `
            : `
        background: white;
        color: #333;
        border: 1px solid #ccc;
        
        &:hover:not(:disabled) {
            background: #f6f6f6;
        }
    `}
`;

const ErrorMessage = styled.div`
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
`;

export const TargetModal: React.FC<TargetModalProps> = ({
    isOpen,
    onClose,
    currentTarget,
    onSubmit,
    isLoading = false,
}) => {
    const [target, setTarget] = useState<string>(currentTarget?.toString() || '50');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTarget(currentTarget?.toString() || '50');
            setError(null);
        }
    }, [isOpen, currentTarget]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const targetValue = parseFloat(target);

        if (isNaN(targetValue)) {
            setError('Veuillez entrer un nombre valide');
            return;
        }

        if (targetValue < 0 || targetValue > 100) {
            setError("L'objectif doit être entre 0 et 100%");
            return;
        }

        onSubmit(targetValue);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        {currentTarget !== null && currentTarget !== 50
                            ? 'Modifier l\'objectif personnalisé'
                            : 'Définir un objectif personnalisé'}
                    </ModalTitle>
                    <CloseButton onClick={onClose} aria-label="Fermer">
                        ×
                    </CloseButton>
                </ModalHeader>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <InfoBox>
                            <InfoText>
                                <strong>Objectif national :</strong> Réduction de 50% de la consommation d'espaces NAF 
                                par rapport à la période 2011-2020.
                            </InfoText>
                        </InfoBox>

                        {error && <ErrorMessage>{error}</ErrorMessage>}

                        <FormGroup>
                            <Label htmlFor="target-input">
                                Objectif de réduction personnalisé (%)
                            </Label>
                            <InputGroup>
                                <Input
                                    id="target-input"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <PercentSymbol>%</PercentSymbol>
                            </InputGroup>
                            <HelpText>
                                Entrez le pourcentage de réduction de la consommation d'espaces NAF que vous souhaitez
                                atteindre entre 2021 et 2031 par rapport à la période 2011-2020.
                            </HelpText>
                        </FormGroup>
                    </ModalBody>

                    <ModalFooter>
                        <Button type="button" $variant="secondary" onClick={onClose} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button type="submit" $variant="primary" disabled={isLoading}>
                            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContainer>
        </ModalOverlay>
    );
};

