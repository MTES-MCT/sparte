import React from 'react';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import Guide from '@components/ui/Guide';
import { LogementVacantOverview, LogementVacantAbstract } from "@components/features/logementVacant";
import { Link } from 'react-router-dom';
import { LandDetailResultType } from "@services/types/land";
import { ProjectDetailResultType } from "@services/types/project";

interface LogementVacantProps {
    endpoint: string;
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const LogementVacant: React.FC<LogementVacantProps> = ({ endpoint, landData, projectData }) => {
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'logement_vacant_autorisation_construction_comparison_chart',
        'logement_vacant_autorisation_construction_ratio_gauge_chart',
        'logement_vacant_autorisation_logement_ratio_progression_chart',
        'logement_vacant_ratio_progression_chart',
        'logement_vacant_conso_progression_chart',
        'logement_vacant_progression_chart',
    ], isLoading);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide
                        title="A propos de la vacance des logements"
                    >
                        On distingue deux formes principales de vacance des logements : la vacance conjoncturelle, qui est de courte durée et nécessaire à la fluidité du marché du logement, et la vacance structurelle, qui pourrait se substituer à la construction neuve de logements, souvent génératrice d'artificialisation des sols et contre laquelle il est légitime de lutter.
                        Dans cette perpective, l'analyse proposée s'appuie sur une définition différenciée selon le type de parc : sont ainsi pris en compte les logements vacants depuis plus de deux ans dans le parc privé et ceux inoccupés depuis plus de 3 mois dans le parc des bailleurs sociaux.
                    </Guide>
                    <div className="fr-mt-7w">
                        <LogementVacantOverview 
                            logements_vacants_status_details={landData.logements_vacants_status_details} 
                            className="fr-mb-3w"
                        />
                        <LogementVacantAbstract
                            logements_vacants_status={landData.logements_vacants_status}
                            logements_vacants_status_details={landData.logements_vacants_status_details}
                            name={landData.name}
                            className="fr-mt-2w"
                        />
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    <div className="fr-callout fr-icon-information-line fr-mt-7w">
                        <h3 className="fr-callout__title fr-text--md">Réduisez votre consommation d'espaces NAF en mobilisant le parc de logements vacants</h3>
                        <p className="fr-callout__text fr-text--sm">Zéro Logement Vacant est un outil gratuit qui accompagne les territoires dans leur démarche de remise sur le marché des logements vacants.</p>
                        <br />
                        <a target="_blank" rel="noopener noreferrer external" title="" href="https://zerologementvacant.beta.gouv.fr/zero-logement-vacant/la-plateforme/?src=mda" className="fr-notice__link fr-link fr-text--sm">
                            Accèder à Zéro Logement Vacant
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogementVacant;
