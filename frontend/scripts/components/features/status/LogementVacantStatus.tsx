import React from 'react';
import styled from 'styled-components';
import { LogementVacantStatusEnum } from '@services/types/land';

const NoticeBody = styled.div`
    flex-direction: column;
    display: flex;
    gap: 0.5rem;
`;

interface LogementVacantStatusProps {
    status?: LogementVacantStatusEnum;
}

interface NoticeContent {
    title: string;
    description: string;
}

const LogementVacantStatus: React.FC<LogementVacantStatusProps> = ({ status }) => {
    // Ce composant informe uniquement sur la disponibilité des données
    // Les conclusions sur le gisement sont dans LogementVacantAbstract

    const noticeContentMap: Partial<Record<LogementVacantStatusEnum, NoticeContent>> = {
        // Secrétisation totale
        [LogementVacantStatusEnum.DONNEES_INDISPONIBLES]: {
            title: "Données non disponibles",
            description: "Les données de logements vacants ne sont pas disponibles pour votre territoire en raison du secret statistique."
        },

        // Secrétisation partielle (données partiellement masquées)
        [LogementVacantStatusEnum.GISEMENT_NUL_PARTIELLEMENT_SECRETISE]: {
            title: "Données du parc privé partiellement secrétisées",
            description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres peuvent être incomplets."
        },
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE_PARTIELLEMENT_SECRETISE]: {
            title: "Données du parc privé partiellement secrétisées",
            description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres affichés peuvent être sous-estimés."
        },
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_PARTIELLEMENT_SECRETISE]: {
            title: "Données du parc privé partiellement secrétisées",
            description: "Certaines données du parc privé sont masquées en raison du secret statistique."
        },
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_PARTIELLEMENT_SECRETISE]: {
            title: "Données du parc privé partiellement secrétisées",
            description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres affichés peuvent être sous-estimés."
        },

        // Données privées indisponibles (secrétisation totale du parc privé)
        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: {
            title: "Données du parc privé non disponibles",
            description: "Les données du parc privé sont indisponibles en raison du secret statistique. Seules les données du parc social sont affichées."
        },
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: {
            title: "Données du parc privé non disponibles",
            description: "Les données du parc privé sont indisponibles en raison du secret statistique. Seules les données du parc social sont affichées."
        },

        // Données sociales indisponibles
        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: {
            title: "Données du parc social non disponibles",
            description: "Les données du parc des bailleurs sociaux ne sont pas disponibles. Seules les données du parc privé sont affichées."
        },
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: {
            title: "Données du parc social non disponibles",
            description: "Les données du parc des bailleurs sociaux ne sont pas disponibles. Seules les données du parc privé sont affichées."
        },
    };

    // Statuts sans notice (toutes les données sont disponibles) :
    // - GISEMENT_NUL
    // - GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE
    // - GISEMENT_POTENTIEL_DANS_LE_SOCIAL
    // - GISEMENT_POTENTIEL_DANS_LE_PRIVE

    if (!status) {
        return null;
    }

    const noticeContent = noticeContentMap[status];

    if (!noticeContent) {
        return null;
    }

    return (
        <div className="fr-notice fr-notice--info fr-mt-3w">
            <div className="fr-container--fluid fr-p-3w">
                <NoticeBody className="fr-notice__body flex-column">
                    <p className="fr-notice__title">{noticeContent.title}</p>
                    <p className="fr-notice__desc fr-text--sm">
                        {noticeContent.description}
                    </p>
                </NoticeBody>
            </div>
        </div>
    );
};

export default LogementVacantStatus;
