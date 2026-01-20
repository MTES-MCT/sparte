import React from 'react';

const TerritorialisationWarning = () => {
    return (
        <div className="fr-notice fr-notice--warning fr-mb-5w">
            <div className="fr-px-2w">
                <div className="fr-notice__body">
                    <p>
                        <span className="fr-notice__title fr-text--sm">
                            L'équipe travaille à l'intégration des objectifs déjà
                            territorialisés de réduction de la consommation d'espaces
                            NAF.{" "}
                        </span>
                        <span className="fr-notice__desc fr-text--sm">
                            Dans l'attente de cette mise à jour, vous pouvez modifier
                            l'objectif du territoire dans le graphique ci-dessous. Par
                            défaut, en attendant cette territorisalisation, l'outil
                            affiche l'objectif national de réduction de 50%.
                            <br />
                            <br />
                            <strong>Cet objectif est fourni à titre indicatif et n'a pas de valeur réglementaire.</strong>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export { TerritorialisationWarning };
