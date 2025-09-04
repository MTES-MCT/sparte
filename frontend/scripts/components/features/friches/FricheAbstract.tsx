import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, pluralize } from "@utils/formatUtils";
import { FricheStatusDetails, FricheStatusEnum } from "@services/types/land";
import styled from "styled-components";

const FricheAbstractContainer = styled.div`
    background-color: white;
    padding: 2rem;
    border-radius: 4px;
`;

interface FricheAbstractProps {
    friche_status: FricheStatusEnum;
    friche_status_details: FricheStatusDetails;
    name: string;
    className?: string;
    link?: string;
}

const FricheAbstract: React.FC<FricheAbstractProps> = ({ friche_status, friche_status_details, name, className, link }) => {
    const potentielContent = (
        <>
            D'après les données disponibles, il y a actuellement <strong>{friche_status_details.friche_sans_projet_count} {pluralize(friche_status_details.friche_sans_projet_count, 'friche')} sans projet</strong> sur le territoire de <strong>{name}</strong>, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_sans_projet_surface })} ha</strong>.<br />
            <strong>La réhabilitation de friches semble être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
        </>
    );

    const abstractContentMap = {
        [FricheStatusEnum.GISEMENT_NUL_ET_SANS_POTENTIEL]: (
            <>
                D'après les données disponibles, il n'y a actuellement <strong>aucune friche sans projet</strong> sur le territoire de <strong>{name}</strong>.<br />
                <strong>La réhabilitation des friches ne semble pas être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </>
        ),
        [FricheStatusEnum.GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE]: (
            <>
                D'après les données disponibles, il n'y a actuellement <strong>aucune friche sans projet</strong> sur le territoire de <strong>{name}</strong>.
                L'absence de friches sans projet est due à l'exploitation du potentiel des friches existantes.<br />
                En effet <strong>{friche_status_details.friche_reconvertie_count} {pluralize(friche_status_details.friche_reconvertie_count, 'friche')} ont été {pluralize(friche_status_details.friche_reconvertie_count, 'reconvertie')}</strong>, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_reconvertie_surface })} ha</strong>,
                et <strong>{friche_status_details.friche_avec_projet_count} {pluralize(friche_status_details.friche_avec_projet_count, 'friche')} sont actuellement en projet</strong>, représentant une surface totale de <strong>{formatNumber({ number: friche_status_details.friche_avec_projet_surface })} ha.</strong><br />
                <strong>La réhabilitation de friches ne semble plus être un levier de sobriété foncière actionnable pour ce territoire.</strong><br />
            </>
        ),
        [FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE]: potentielContent,
        [FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION]: potentielContent,
    };

    return (
        <FricheAbstractContainer className={className}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <h3 className="fr-text--lg fr-mb-2w">
                        <i className="bi bi-lightning-charge text-primary fr-mr-1w" /> 
                        Les friches sans projet : un levier actionnable pour la sobriété foncière
                    </h3>
                    <p className="fr-text--sm fr-mb-0">
                        {abstractContentMap[friche_status]}
                    </p>
                    {link && <Link to={link} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Accéder au détail des friches</Link>}
                </div>
            </div>
        </FricheAbstractContainer>
    );
};

export default FricheAbstract;
