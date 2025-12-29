import React, { useState, useEffect } from 'react';
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";

interface TargetModalProps {
    currentTarget: number | null;
    onSubmit: (newTarget: number) => void;
    isLoading?: boolean;
    objectifTerritorialise?: number | null;
}

const modal = createModal({
    id: "target-modal",
    isOpenedByDefault: false,
});

export const TargetModal: React.FC<TargetModalProps> = ({
    currentTarget,
    onSubmit,
    isLoading = false,
    objectifTerritorialise = null,
}) => {
    const [target, setTarget] = useState<string>(currentTarget?.toString() || '50');
    const [error, setError] = useState<string | null>(null);

    // L'objectif de référence est l'objectif territorialisé s'il existe, sinon 50%
    const objectifReference = objectifTerritorialise ?? 50;

    useEffect(() => {
        if (modal.isOpenedByDefault) {
            setTarget(currentTarget?.toString() || '50');
            setError(null);
        }
    }, [currentTarget]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setError(null);

        const targetValue = parseFloat(target);

        if (isNaN(targetValue)) {
            setError('Veuillez entrer un nombre valide');
            return false;
        }

        if (targetValue < 0 || targetValue > 100) {
            setError("L'objectif doit être entre 0 et 100%");
            return false;
        }

        onSubmit(targetValue);
        modal.close();
        return true;
    };

    return (
        <modal.Component
            title={
                currentTarget !== null && currentTarget !== objectifReference
                    ? 'Modifier l\'objectif personnalisé'
                    : 'Définir un objectif personnalisé'
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <Alert
                        severity="error"
                        description={error}
                        small
                        className="fr-mb-3w"
                    />
                )}

                <Input
                    label="Objectif de réduction personnalisé (%)"
                    hintText="Entrez le pourcentage de réduction de la consommation d'espaces NAF que vous souhaitez atteindre entre 2021 et 2031 par rapport à la période 2011-2021."
                    nativeInputProps={{
                        type: "number",
                        min: 0,
                        max: 100,
                        step: 0.1,
                        value: target,
                        onChange: (e) => {
                            setTarget(e.target.value);
                        },
                        disabled: isLoading,
                        required: true,
                    }}
                />

                <div className="fr-modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <Button
                        priority="secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            modal.close();
                        }}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            handleSubmit(e);
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </modal.Component>
    );
};

export const useTargetModal = () => modal;
