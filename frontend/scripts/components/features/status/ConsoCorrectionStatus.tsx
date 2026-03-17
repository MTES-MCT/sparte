import React from 'react';
import Notice from '@components/ui/Notice';

export enum ConsoCorrectionStatusEnum {
    DONNEES_CORRIGEES = 'données_coriggées',
    DONNEES_INCHANGEES_AVEC_DONNEES_MANQUANTES = 'données_inchangées_avec_données_manquantes',
    DONNEES_PARTIELLEMENT_CORRIGEES = 'données_partiellement_coriggées',
    DONNEES_INCHANGEES = 'données_inchangées',
    DONNEES_MANQUANTES = 'données_manquantes',
    DONNEES_CORRIGEES_AVEC_DONNEES_MANQUANTES = 'données_coriggées_avec_données_manquantes',
    DONNEES_PARTIELLEMENT_CORRIGEES_AVEC_DONNEES_MANQUANTES = 'données_partiellement_coriggées_avec_données_manquantes'
}

interface StatusMessage {
    title: string;
    message: string;
}

const defaultTitle = "Données de consommation modifiées.";
const warningTitle = "Données de consommation indisponibles.";
const missingMessage = "Votre territoire est absent du dernier millésime de données de consommation d'espaces NAF. Pour plus d'informations, rapprochez-vous du CEREMA, producteur de cette donnée.";

export const consoCorrectionStatusMessages: { [key in ConsoCorrectionStatusEnum]?: StatusMessage } = {
    'données_coriggées': {
        title: defaultTitle,
        message: missingMessage,
    },
    'données_partiellement_coriggées': {
        title: defaultTitle,
        message: `Certaines données de consommation d'espaces NAF ont été corrigées pour votre territoire, il s'agit la plupart du temps d'erreur de Code Officiel Géographique dans les données sources.`
    },
    'données_inchangées_avec_données_manquantes': {
        title: "Données de consommation partiellement disponibles.",
        message: 'Certaines communes de votre territoire sont absentes du dernier millésime de données de consommation d\'espaces NAF.'
    },
    'données_manquantes': {
        title: warningTitle,
        message: missingMessage,
    },
    'données_coriggées_avec_données_manquantes': {
        title: defaultTitle,
        message: `Certaines données de consommation d'espaces NAF ont été corrigées pour votre territoire, et certaines communes sont absentes du dernier millésime.`
    },
    'données_partiellement_coriggées_avec_données_manquantes': {
        title: defaultTitle,
        message: `Certaines données de consommation d'espaces NAF ont été corrigées pour votre territoire, et certaines communes sont absentes du dernier millésime.`
    }
};

export interface ConsoCorrectionStatusProps {
  status: ConsoCorrectionStatusEnum;
}

const ConsoCorrectionStatus: React.FC<ConsoCorrectionStatusProps> = ({ status }) => {
  const content = consoCorrectionStatusMessages[status];
  if (!content) return null;

    const statusMessage = consoCorrectionStatusMessages[status];
    if (!statusMessage) return null;

    const { title, message } = statusMessage;

    return (
        <Notice type="warning" title={title} description={message} />
    );
};

export default ConsoCorrectionStatus;
