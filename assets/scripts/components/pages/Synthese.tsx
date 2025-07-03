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
import styled from 'styled-components';
import { FricheOverview } from "@components/features/friches";

const ChartSkeleton = styled.div`
    width: 100%;
    height: 250px;
    background-color: #f0f0f0;
    border-radius: 10px;
`;

const TryptiqueContainer = styled.div`
    display: flex;
    gap: 2rem;
    justify-content: center;
`;

const TryptiqueCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

const TryptiqueIcon = styled.div`
    font-size: 2em;
    margin-bottom: 1rem;
`;

const TryptiqueText = styled.div`
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

interface SyntheseProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

const ArtificialisationSection: React.FC<{ 
    projectData: ProjectDetailResultType;
    landData: LandDetailResultType;
}> = ({ landData, projectData }) => {
    const { urls } = projectData;

    const { landArtifStockIndex : data, isLoading, error } = useArtificialisation({
        landData
    });

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-mt-7w">
            <h4>Artificialisation des sols </h4>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <p className="fr-callout__title">{formatNumber({ number: data.surface })} ha</p>
                        <p>
                            Surface artificialisée
                            {" "}
                            <MillesimeDisplay 
                                is_interdepartemental={landData.is_interdepartemental}
                                landArtifStockIndex={data}
                            />
                        </p>
                        <span className={`fr-badge ${
                            data.flux_surface >= 0
                                ? "fr-badge--error"
                                : "fr-badge--success"
                        } fr-badge--error fr-badge--sm fr-badge--no-icon`}>
                            {formatNumber({
                                number: data.flux_surface,
                                addSymbol: true,
                            })} ha
                            {data.flux_surface >= 0 ? (
                                <i className="bi bi-arrow-up-right fr-ml-1w" />
                            ) : (
                                <i className="bi bi-arrow-down-right fr-ml-1w" />
                            )}
                        </span>
                        <MillesimeDisplay 
                            is_interdepartemental={landData.is_interdepartemental}
                            landArtifStockIndex={data}
                            between={true}
                            className="fr-text--sm fr-ml-1w"
                        />
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <p className="fr-callout__title">{formatNumber({ number: data.percent })}%</p>
                        <p>Taux d'artificialisation du territoire</p>
                    </div>
                </div>
            </div>
            
            <div className="fr-my-3w">
                <LandMillesimeTable 
                    millesimes={landData.millesimes}
                    territory_name={landData.name}
                    is_interdepartemental={landData.is_interdepartemental}
                />
            </div>
            
            <Link className="fr-link" to={urls.artificialisation}>Consulter le détail de l'artificialisation des sols</Link>
        </div>
    );
};

const tryptiqueConso = [
    {
        icon: 'bi-diagram-3',
        text: "Consommation d’espaces par destinations"
    },
    {
        icon: 'bi-people',
        text: 'Indicateurs démographiques',
    },
    {
        icon: 'bi-bar-chart-line',
        text: 'Comparaison avec d’autres territoires',
    }
];

const tryptiqueArtif = [
    {
        icon: 'bi-diagram-3',
        text: "Evolution de l’artificialisation"
    },
    {
        icon: 'bi-people',
        text: 'Répartition par couverture et usage ',
    },
    {
        icon: 'bi-bar-chart-line',
        text: 'Cartographie des sols artificialisés',
    }
];

const Synthese: React.FC<SyntheseProps> = ({ 
	projectData,
	landData,
}) => {
    const {
        isLoading,
        error
    } = useArtificialisation({
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
            <h2 className="fr-mt-5w">Comprendre : les enjeux de la sobriété foncière</h2>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <div className="fr-mb-3w">
                            <ChartSkeleton />
                        </div>
                        <p>
                            Depuis 2011, la consommation d'espaces NAF a tendance à diminuer sur le territoire de Toulon.
                        </p>
                        <h5 className="fr-mt-3w">Pour aller plus loin</h5>
                        <TryptiqueContainer>
                          {tryptiqueConso.map((item, idx) => (
                            <TryptiqueCard key={idx}>
                              <TryptiqueIcon>
                                <i className={`bi ${item.icon}`} />
                              </TryptiqueIcon>
                              <TryptiqueText>{item.text}</TryptiqueText>
                            </TryptiqueCard>
                          ))}
                        </TryptiqueContainer>
                        <Link to={projectData.urls.consommation} className="fr-link fr-text--sm">Accéder au bilan de la consommation</Link>
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <h4 className="fr-mb-3w">Période 2021 - 2031 : Mesure de la consommation d'espaces NAF</h4>
                        <p className="fr-text--sm fr-mb-2w">
                            La première étape de loi Climat et Résilience consiste à réduire de <strong>50 %</strong> la consommation d'espaces entre 2021 et 2031, par rapport à la consommation entre 2011 et 2020 (période de référence). 
                        </p>
                        <p className="fr-text--sm fr-mb-2w">
                            Sur le territoire de Toulon, 41,2 ha ont été consommés entre 2011 et 2022. <strong>La consommation d'espaces maximale autorisée pour ce territoire est donc de 20,6 ha pour la période 2021-2030.</strong>
                        </p>
                        <p className="fr-text--sm fr-mb-2w">
                            Depuis 2021, 10 ha ont déjà été consommés, soit 2,5 ha en moyenne annuelle. Si la consommation d'espaces de ce territoire se poursuivait au même rythme, l'objectif non-réglementaire de réduction à horizon 2031 (53%) <strong>serait dépassé en 2028.</strong>
                        </p>
                        <Link to={projectData.urls.trajectoires} className="fr-link fr-text--sm">Visualiser la trajectoire de sobriété foncière</Link>
                    </div>
                </div>
            </div>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <div className="fr-mb-3w">
                            <ChartSkeleton />
                        </div>
                        <p>
                            Entre 2019 et 2021, la surface artificialisée a augmenté de 130 ha sur le territoire de Toulon.
                        </p>
                        <h5 className="fr-mt-3w">Pour aller plus loin</h5>
                        <TryptiqueContainer>
                          {tryptiqueArtif.map((item, idx) => (
                            <TryptiqueCard key={idx}>
                              <TryptiqueIcon>
                                <i className={`bi ${item.icon}`} />
                              </TryptiqueIcon>
                              <TryptiqueText>{item.text}</TryptiqueText>
                            </TryptiqueCard>
                          ))}
                        </TryptiqueContainer>
                        <Link to={projectData.urls.artificialisation} className="fr-link fr-text--sm">Accéder au bilan de l'artificialisation</Link>
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <h4 className="fr-mb-3w">Période 2021 - 2050 : Mesure de l’artificialisation</h4>
                        <p className="fr-text--sm fr-mb-2w">
                            La deuxième étape de loi Climat et Résilience consiste à atteindre <strong>l'objectif de zéro artificialisation nette à horizon 2050</strong>, mesurée avec les données, non plus de consommation d'espaces, mais d'artificialisation du sol, reposant sur la donnée OCSGE.
                        </p>
                        <p className="fr-text--sm fr-mb-2w">
                            Sur le territoire de Toulon, entre 2019 et 2021, 30,7 ha ont été artificialisés tandis que 4,9 ha ont été désartificialisés. <strong>Cela signifie que l'artificialisation nette sur la période est de 25,9 ha.</strong>
                        </p>
                        <Link to={projectData.urls.trajectoires} className="fr-link fr-text--sm">Visualiser la trajectoire de sobriété foncière</Link>
                    </div>
                </div>
            </div>
            <h2 className="fr-mt-5w">Agir : les leviers de la sobriété foncière</h2>
            
            <div className="fr-mt-3w">
                <h3>Réhabilitation des friches</h3>
                <p className="fr-text--sm fr-mb-3w">
                    Les friches représentent un potentiel important pour limiter l'artificialisation des sols. 
                    La réhabilitation de ces espaces permet de redynamiser les territoires tout en préservant les espaces naturels.
                </p>
                <FricheOverview 
                    friche_status_details={landData.friche_status_details} 
                    landData={landData}
                />
            </div>
            
            {/* {landData?.has_ocsge && <ArtificialisationSection landData={landData} projectData={projectData} />} */}
        </div>
    );
};

export default Synthese;
