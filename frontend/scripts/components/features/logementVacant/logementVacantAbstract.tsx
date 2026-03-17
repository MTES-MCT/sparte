import React from 'react';
import { formatNumber, pluralize } from "@utils/formatUtils";
import { LogementVacantStatusEnum, LogementsVacantsStatusDetails } from "@services/types/land";
import styled from "styled-components";
import Button from "@components/ui/Button";

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
    contentOnly?: boolean;
}

const LogementVacantAbstract: React.FC<LogementVacantAbstractProps> = ({
    logements_vacants_status,
    logements_vacants_status_details,
    name,
    className,
    link,
    contentOnly = false,
}) => {
    const contentMap = {
        [LogementVacantStatusEnum.DONNEES_INDISPONIBLES]: (
            <p className="fr-text--sm fr-mb-0">
                <strong>Il n'est pas possible de déterminer si l'exploitation des logements vacants est un levier de sobriété foncière pour le territoire de {name}.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL]: (
            <p className="fr-text--sm fr-mb-0">
                Il n'y a actuellement <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.{" "}
                <strong>L'exploitation des logements vacants ne semble pas être un levier actionnable pour ce territoire.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_PARTIELLEMENT_SECRETISE]: (
            <p className="fr-text--sm fr-mb-0">
                Dans les données disponibles, il n'y a actuellement{" "}
                <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.{" "}
                <strong>L'exploitation des logements vacants ne semble pas être un levier actionnable, sous réserve des données manquantes.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: (
            <p className="fr-text--sm fr-mb-0">
                Le parc social ne compte <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.{" "}
                <strong>Il n'est pas possible de conclure pour le parc privé (données indisponibles).</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: (
            <p className="fr-text--sm fr-mb-0">
                Le parc privé ne compte <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.{" "}
                <strong>Il n'est pas possible de conclure pour le parc social (données indisponibles).</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_general} {pluralize(logements_vacants_status_details.logements_vacants_parc_general, "logement vacant")}</strong>{" "}
                sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_general_percent })}%</strong> du parc total.{" "}
                Parmi eux, <strong>{logements_vacants_status_details.logements_vacants_parc_prive}</strong> dans le parc privé
                et <strong>{logements_vacants_status_details.logements_vacants_parc_social}</strong> dans le parc social.{" "}
                <strong>L'exploitation des logements vacants semble être un levier actionnable pour ce territoire.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE_PARTIELLEMENT_SECRETISE]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a au moins{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_general} {pluralize(logements_vacants_status_details.logements_vacants_parc_general, "logement vacant")}</strong>{" "}
                sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_general_percent })}%</strong> du parc total.{" "}
                <strong>L'exploitation des logements vacants semble être un levier actionnable pour ce territoire (chiffres potentiellement sous-estimés).</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, "logement vacant")}</strong>{" "}
                dans le parc social sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.{" "}
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable pour ce territoire.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_PARTIELLEMENT_SECRETISE]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, "logement vacant")}</strong>{" "}
                dans le parc social sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.{" "}
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable pour ce territoire.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social ?? 0, "logement vacant")}</strong>{" "}
                dans le parc social sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc social.{" "}
                <strong>L'exploitation des logements vacants du parc social semble être un levier actionnable. Il n'est pas possible de conclure pour le parc privé (données indisponibles).</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, "logement vacant")}</strong>{" "}
                dans le parc privé sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.{" "}
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable pour ce territoire.</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_PARTIELLEMENT_SECRETISE]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a au moins{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, "logement vacant")}</strong>{" "}
                dans le parc privé sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.{" "}
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable (chiffres potentiellement sous-estimés).</strong>
            </p>
        ),

        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: (
            <p className="fr-text--sm fr-mb-0">
                Il y a actuellement{" "}
                <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive ?? 0, "logement vacant")}</strong>{" "}
                dans le parc privé sur le territoire de <strong>{name}</strong>, soit{" "}
                <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.{" "}
                <strong>L'exploitation des logements vacants du parc privé semble être un levier actionnable. Il n'est pas possible de conclure pour le parc social (données indisponibles).</strong>
            </p>
        ),
    };

    if (contentOnly) {
        return <>{contentMap[logements_vacants_status]}</>;
    }

    return (
        <LogementVacantAbstractContainer className={className}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <h3 className="fr-text--lg fr-mb-2w">
                        <i className="bi bi-lightning-charge text-primary fr-mr-1w" />
                        Les logements vacants : un levier actionnable pour la sobriété foncière
                    </h3>
                    {contentMap[logements_vacants_status]}
                    {link && (
                        <Button to={link} icon="bi bi-arrow-right" iconPosition="right" className="fr-mt-3w">
                            Accéder au détail des logements vacants
                        </Button>
                    )}
                </div>
            </div>
        </LogementVacantAbstractContainer>
    );
};

export default LogementVacantAbstract;
