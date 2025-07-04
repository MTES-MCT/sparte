import React from 'react';
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";
import { FricheStatusEnum, LandDetailResultType } from "@services/types/land";

const FricheStatusContainer = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 4px;
    margin-top: 2rem;
`;

interface FricheStatusProps {
    landData: LandDetailResultType;
    children?: React.ReactNode;
}

const FricheStatus: React.FC<FricheStatusProps> = ({ landData, children }) => {
    const { friche_status, name, friche_status_details } = landData;
    
    const generateStatusContent = () => {
        if (friche_status === FricheStatusEnum.GISEMENT_NUL_ET_SANS_POTENTIEL) {
            return (
                <>
                    D'après les données disponible, il n'y actuellement <strong>aucune friche sans projet</strong> sur le territoire de {name}.<br />
                    <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
                </>
            );
        }
        
        if (friche_status === FricheStatusEnum.GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE) {
            return (
                <>
                    D'après les données disponible, il n'y actuellement <strong>aucune friche sans projet</strong> sur le territoire de {name}.
                    L'absence de friches sans projet est due à l'exploitation du potentiel des friches existantes.<br />
                    En effet {friche_status_details.friche_reconvertie_count} friche{friche_status_details.friche_reconvertie_count > 0 ? 's' : ''} ont été reconvertie{friche_status_details.friche_reconvertie_count > 0 ? 's' : ''}, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_reconvertie_surface })} ha</strong>,
                    et {friche_status_details.friche_avec_projet_count} friche{friche_status_details.friche_avec_projet_count > 0 ? 's' : ''} sont actuellement en projet, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_avec_projet_surface })} ha.</strong><br />
                    <strong>La réhabilitation de friches ne semble plus être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
                </>
            );
        }
        
        if (friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE || friche_status === FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION) {
            return (
                <>
                    D'après les données disponible, il y a actuellement <strong>{friche_status_details.friche_sans_projet_count} friche{friche_status_details.friche_sans_projet_count > 0 ? 's' : ''} sans projet</strong> sur le territoire de {name}, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_sans_projet_surface })} ha</strong>.<br />
                    <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
                </>
            );
        }
        
        return null;
    };

    return (
        <FricheStatusContainer>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <h3 className="fr-text--lg fr-mb-2w">
                        <i className="bi bi-lightning-charge text-primary fr-mr-1w" /> 
                        Les friches sans projet : un levier actionnable pour la sobriété foncière
                    </h3>
                    {generateStatusContent() && (
                        <p className="fr-text--sm fr-mb-0">
                            {generateStatusContent()}
                        </p>
                    )}
                    {children}
                </div>
            </div>
        </FricheStatusContainer>
    );
};

export default FricheStatus;
