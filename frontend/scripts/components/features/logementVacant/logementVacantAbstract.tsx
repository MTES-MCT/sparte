import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, pluralize } from "@utils/formatUtils";
import { LogementVacantStatusEnum, LogementsVacantsStatusDetails } from "@services/types/land";
import styled from "styled-components";

const LogementVacantAbstractContainer = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 4px;
`;

interface LogementVacantAbstractProps {
    logements_vacants_status: LogementVacantStatusEnum;
    logements_vacants_status_details: LogementsVacantsStatusDetails;
    name: string;
    className?: string;
    link?: string;
}

const LogementVacantAbstract: React.FC<LogementVacantAbstractProps> = ({
    logements_vacants_status,
    logements_vacants_status_details,
    name,
    className,
    link
}) => {
    const abstractContentMap = {
        [LogementVacantStatusEnum.DONNEES_INDISPONIBLES]: (
            <>
                <strong>Il n'est pas possible de déterminer si l'exploitation des logements vacants est un levier de sobriété foncière pour le territoire de {name}.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL]: (
            <>
                Il n'y a actuellement <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>L'exploitation des logements vacants ne semble pas être un levier actionnable pour ce territoire.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_PARTIELLEMENT_SECRETISE]: (
            <>
                Dans les données disponibles, il n'y a actuellement <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>L'exploitation des logements vacants ne semble pas être un levier actionnable, sous réserve des données manquantes.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: (
            <>
                Le parc social ne compte <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>Le gisement est nul dans le parc social. Il n'est pas possible de conclure pour le parc privé (données indisponibles).</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: (
            <>
                Le parc privé ne compte <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>Le gisement est nul dans le parc privé. Il n'est pas possible de conclure pour le parc social (données indisponibles).</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_general} {pluralize(logements_vacants_status_details.logements_vacants_parc_general, 'logement vacant')}</strong> sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_general_percent })}%</strong> du parc total.<br />
                Parmi eux, <strong>{logements_vacants_status_details.logements_vacants_parc_prive}</strong> dans le parc privé
                et <strong>{logements_vacants_status_details.logements_vacants_parc_social}</strong> dans le parc social.<br />
                <strong>L'exploitation des logements vacants semble être un levier actionnable pour ce territoire.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE_PARTIELLEMENT_SECRETISE]: (
            <>
                Il y a au moins <strong>{logements_vacants_status_details.logements_vacants_parc_general} {pluralize(logements_vacants_status_details.logements_vacants_parc_general, 'logement vacant')}</strong> sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_general_percent })}%</strong> du parc total.<br />
                Parmi eux, <strong>{logements_vacants_status_details.logements_vacants_parc_prive}</strong> dans le parc privé
                et <strong>{logements_vacants_status_details.logements_vacants_parc_social}</strong> dans le parc social.<br />
                <strong>L'exploitation des logements vacants semble être un levier actionnable pour ce territoire (chiffres potentiellement sous-estimés).</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, 'logement vacant')}</strong> dans le parc social sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.
                Le parc privé ne compte aucun logement vacant.<br />
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable pour ce territoire.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_PARTIELLEMENT_SECRETISE]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, 'logement vacant')}</strong> dans le parc social sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.
                Le parc privé ne compte aucun logement vacant dans les données disponibles.<br />
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable pour ce territoire.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, 'logement vacant')}</strong> dans le parc social sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.<br />
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable. Il n'est pas possible de conclure pour le parc privé (données indisponibles).</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, 'logement vacant')}</strong> dans le parc privé sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.
                Le parc social ne compte aucun logement vacant.<br />
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable pour ce territoire.</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_PARTIELLEMENT_SECRETISE]: (
            <>
                Il y a au moins <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, 'logement vacant')}</strong> dans le parc privé sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.
                Le parc social ne compte aucun logement vacant.<br />
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable (chiffres potentiellement sous-estimés).</strong>
            </>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: (
            <>
                Il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, 'logement vacant')}</strong> dans le parc privé sur le territoire de <strong>{name}</strong>,
                soit <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.<br />
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable. Il n'est pas possible de conclure pour le parc social (données indisponibles).</strong>
            </>
        ),
    };

    return (
        <LogementVacantAbstractContainer className={className}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <h3 className="fr-text--lg fr-mb-2w">
                        <i className="bi bi-lightning-charge text-primary fr-mr-1w" />
                        Les logements vacants : un levier actionnable pour la sobriété foncière
                    </h3>
                    <p className="fr-text--sm fr-mb-0">
                        {abstractContentMap[logements_vacants_status]}
                    </p>
                    {link && <Link to={link} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Accéder au détail des logements vacants</Link>}
                </div>
            </div>
        </LogementVacantAbstractContainer>
    );
};

export default LogementVacantAbstract;
