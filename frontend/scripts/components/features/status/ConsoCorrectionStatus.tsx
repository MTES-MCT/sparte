import React from 'react';
import styled from 'styled-components';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;

export enum ConsoCorrectionStatusEnum {
    DONNEES_CORRIGEES = 'données_coriggées',
    DONNEES_INCHANGEES_AVEC_DONNEES_MANQUANTES = 'données_inchangées_avec_données_manquantes',
    DONNEES_PARTIELLEMENT_CORRIGEES = 'données_partiellement_coriggées',
    DONNEES_INCHANGEES = 'données_inchangées',
    DONNEES_MANQUANTES = 'données_manquantes'
}

interface IconsoCorrectionStatusMessages {
    title: string;
    message: string;
}

const defaultTitle = "Données de consommation modifiées";
const warningTitle = "Données de consommation indisponibles";
const missingMessage = `Votre territoire est absent du dernier millésime de données de consommation d'espaces NAF. Pour plus d'informations, rapprochez-vous du CEREMA, producteur de cette donnée.`

export const consoCorrectionStatusMessages: { [key in ConsoCorrectionStatusEnum]?: IconsoCorrectionStatusMessages } = {
    'données_coriggées': {
        title: defaultTitle,
        message: missingMessage,
    },
    'données_partiellement_coriggées': {
        title: defaultTitle,
        message: `Certaines données de consommation d'espaces NAF ont été corrigées pour votre territoire, il s'agit la plupart du temps d'erreur de Code Officiel Géographique dans les données sources.`
    },
    'données_inchangées_avec_données_manquantes': {
        title: "Données de consommation partiellement disponibles",
        message: 'Certaines communes de votre territoire sont absentes du dernier millésime de données de consommation d\'espaces NAF.'
    },
    'données_manquantes': {
        title: warningTitle,
        message: missingMessage,
    }
};


export interface ConsoCorrectionStatusProps {
    status: ConsoCorrectionStatusEnum;
}

const ConsoCorrectionStatus: React.FC<ConsoCorrectionStatusProps> = ({ status }) => {

    const title = consoCorrectionStatusMessages[status].title;
    const message = consoCorrectionStatusMessages[status].message;
    
    return (
        <div className="fr-notice fr-notice--info fr-my-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body flex-column">
                    <p className="fr-notice__title">{ title }</p>
                    <p className="fr-notice__desc fr-text--sm">{ message }</p>
                </NoticeBody>
            </div>
        </div>
    );
};

export default ConsoCorrectionStatus;
