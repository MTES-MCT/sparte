import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import Loader from '@components/ui/Loader';
import { formatNumber } from "@utils/formatUtils";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { useArtificialisation } from "@hooks/useArtificialisation";
import Guide from "@components/ui/Guide";
import { FricheOverview, FricheAbstract } from "@components/features/friches";
import { LogementVacantOverview, LogementVacantAbstract } from "@components/features/logementVacant";

interface SyntheseProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

const Synthese: React.FC<SyntheseProps> = ({ 
	projectData,
	landData,
}) => {
    const { landArtifStockIndex : data, isLoading, error } = useArtificialisation({
        landData
    });

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
				<div className="fr-col-12">
                    <Guide
                        title="Pourquoi la sobriété foncière ?"
                        DrawerTitle="Pourquoi la sobriété foncière ?"
                        drawerChildren={
                            <>
                                <p className="fr-text--sm mb-3">
                                    La sobriété foncière est essentielle pour préserver les sols naturels, agricoles et forestiers, indispensables à la biodiversité.
                                    Elle limite l'artificialisation, qui fragilise les écosystèmes et accentue les risques climatiques. Réduire l'étalement urbain permet de contenir les émissions de gaz à effet de serre, 
                                    et constitue un levier clé pour protéger les ressources et renforcer la résilience écologique des territoires.
                                </p>
                            </>
                        }
                    >
                         La sobriété foncière est essentielle pour préserver les sols naturels, agricoles et forestiers, indispensables à la biodiversité.
                        Elle limite l'artificialisation, qui fragilise les écosystèmes et accentue les risques climatiques. Réduire l'étalement urbain permet de contenir les émissions de gaz à effet de serre, 
                        et constitue un levier clé pour protéger les ressources et renforcer la résilience écologique des territoires.
                    </Guide>
				</div>
			</div>
            <h2 className="fr-mt-5w">Mesurer : les objectifs nationaux de sobriété foncière</h2>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="bg-white fr-p-3w rounded w-100">
                        <div className="fr-mb-3w">
                            graphique
                        </div>
                        <p>
                            Depuis 2011, la consommation d'espaces NAF a tendance à diminuer sur le territoire de Toulon.
                        </p>
                        <Link to={projectData.urls.consommation} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Accéder au bilan de la consommation</Link>
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="bg-white fr-p-3w rounded w-100">
                        <h4 className="fr-mb-3w">Période 2021 - 2031 : Mesure de la consommation d'espaces NAF</h4>
                        <p className="fr-text--sm fr-mb-2w">
                            La première étape de loi Climat et Résilience consiste à réduire de <strong>50 %</strong> la consommation d'espaces entre 2021 et 2031, par rapport à la consommation entre 2011 et 2020 (période de référence). 
                        </p>
                        <p className="fr-text--sm fr-mb-2w">
                            Sur le territoire de <strong>{landData.name}</strong>, 41,2 ha ont été consommés entre 2011 et 2022. <strong>La consommation d'espaces maximale autorisée pour ce territoire est donc de 20,6 ha pour la période 2021-2030.</strong>
                        </p>
                        <p className="fr-text--sm fr-mb-2w">
                            Depuis 2021, 10 ha ont déjà été consommés, soit 2,5 ha en moyenne annuelle. Si la consommation d'espaces de ce territoire se poursuivait au même rythme, l'objectif non-réglementaire de réduction à horizon 2031 (53%) <strong>serait dépassé en 2028.</strong>
                        </p>
                        <Link to={projectData.urls.trajectoires} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Visualiser la trajectoire de sobriété foncière</Link>
                    </div>
                </div>
            </div>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-5w">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="bg-white fr-p-3w rounded w-100">
                        <div className="fr-mb-3w">
                            graphique
                        </div>
                        <p>
                            Entre 2019 et 2021, la surface artificialisée a augmenté de 130 ha sur le territoire de Toulon.
                        </p>
                        <Link to={projectData.urls.artificialisation} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Accéder au bilan de l'artificialisation</Link>
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="bg-white fr-p-3w rounded w-100">
                        <h4 className="fr-mb-3w">Période 2031 - 2050 : Mesure de l’artificialisation</h4>
                        <p className="fr-text--sm fr-mb-2w">
                            La deuxième étape de loi Climat et Résilience consiste à atteindre <strong>l'objectif de zéro artificialisation nette à horizon 2050</strong>, mesurée avec les données, non plus de consommation d'espaces, mais d'artificialisation du sol, reposant sur la donnée OCS GE.
                        </p>
                        <LandMillesimeTable 
                            millesimes={landData.millesimes}
                            territory_name={landData.name}
                            is_interdepartemental={landData.is_interdepartemental}
                        />
                        <p className="fr-text--sm fr-mt-2w">
                            Sur le territoire de
                            {" "}
                            <strong>{landData.name}</strong>
                            ,
                                <MillesimeDisplay 
                                    is_interdepartemental={landData.is_interdepartemental}
                                    landArtifStockIndex={data}
                                    between={true}
                                    className="fr-text--sm fr-ml-1w"
                                />
                            ,
                            {" "}
                            {formatNumber({
                                number: data.flux_surface,
                            })} ha
                            ont été artificialisés.
                        </p>
                        <Link to={projectData.urls.trajectoires} className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm">Visualiser la trajectoire de sobriété foncière</Link>
                    </div>
                </div>
            </div>
            <h2 className="fr-mt-10w">Agir : les leviers de la sobriété foncière</h2>
            <div className="fr-mt-5w">
                <h3>Vacance des Logements</h3>
                <LogementVacantOverview 
                    logements_vacants_status_details={landData.logements_vacants_status_details} 
                    className="fr-mb-3w"
                />
                <LogementVacantAbstract
                    logements_vacants_status={landData.logements_vacants_status}
                    logements_vacants_status_details={landData.logements_vacants_status_details}
                    name={landData.name}
                    className="fr-mt-2w"
                    link={projectData.urls.logementVacant}
                />
            </div>
            <div className="fr-mt-7w">
                <h3>Réhabilitation des friches</h3>
                <FricheOverview 
                    friche_status_details={landData.friche_status_details} 
                    className="fr-mb-3w"
                />
                <FricheAbstract
                    friche_status={landData.friche_status}
                    friche_status_details={landData.friche_status_details}
                    name={landData.name}
                    className="fr-mt-2w"
                    link={projectData.urls.friches}
                />
            </div>
        </div>
    );
};

export default Synthese;
