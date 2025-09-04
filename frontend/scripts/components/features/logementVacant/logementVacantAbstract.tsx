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
        [LogementVacantStatusEnum.GISEMENT_NUL]: (
            <>
                D'après les données disponibles, il n'y a actuellement <strong>aucun logement vacant</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>L'exploitation des logements vacants ne semble pas être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </>
        ),
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE]: (
            <>
                D'après les données disponibles, il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_general} {pluralize(logements_vacants_status_details.logements_vacants_parc_general, 'logement vacant')}</strong> sur le territoire de <strong>{name}</strong>, 
                représentant <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_general_percent })}%</strong> du parc total.<br />
                Parmi eux, <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive, 'logement vacant')}</strong> dans le parc privé 
                et <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social, 'logement vacant')}</strong> dans le parc des bailleurs sociaux.<br />
                <strong>L'exploitation des logements vacants semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </>
        ),
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL]: (
            <>
                D'après les données disponibles, il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_social} {pluralize(logements_vacants_status_details.logements_vacants_parc_social, 'logement vacant')} dans le parc des bailleurs sociaux</strong> sur le territoire de <strong>{name}</strong>, 
                représentant <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_social_percent })}%</strong> du parc des bailleurs sociaux.<br />
                <strong>L'exploitation des logements vacants du parc des bailleurs sociaux semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </>
        ),
        [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE]: (
            <>
                D'après les données disponibles, il y a actuellement <strong>{logements_vacants_status_details.logements_vacants_parc_prive} {pluralize(logements_vacants_status_details.logements_vacants_parc_prive, 'logement vacant')} dans le parc privé</strong> sur le territoire de <strong>{name}</strong>, 
                représentant <strong>{formatNumber({ number: logements_vacants_status_details.logements_vacants_parc_prive_percent })}%</strong> du parc privé.<br />
                <strong>L'exploitation des logements vacants du parc privé semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
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
