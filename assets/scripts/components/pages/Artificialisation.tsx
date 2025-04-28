import React from 'react';
import Guide from '@components/widgets/Guide';
import OcsgeMatricePassage from '@images/ocsge_matrice_passage.png';
import {useGetArtifZonageIndexQuery } from '@services/api';
import { OcsgeGraph } from '@components/charts/ocsge/OcsgeGraph';
import { ArtifPercentRateChart } from '@components/charts/artificialisation/ArtifPercentRateChart';
import { ProjectDetailResultType } from '@services/types/project';
import { LandDetailResultType, MillesimeByIndex } from '@services/types/land';
import { OcsgeMapContainer } from '@components/map/ocsge/OcsgeMapContainer';
import styled, { css }  from 'styled-components';

const BigNumberStyle = css`
    font-size: 3rem;
    font-weight: bold;
    line-height: 3rem;
`;

const SurfaceArtif = styled.div`
    ${BigNumberStyle}
`;

const PercentArtif = styled.div`
    ${BigNumberStyle}
    color: #ff4545;
`;


export const OcsgeMillesimeSelector = ({ 
    index, 
    setIndex, 
    byDepartement, 
    setByDepartement, 
    millesimes_by_index, 
    shouldDisplayByDepartementBtn 
}: {
    index: number, 
    setIndex: (index: number) => void, 
    byDepartement: boolean, 
    setByDepartement: (byDepartement: boolean) => void, 
    millesimes_by_index: MillesimeByIndex[], 
    shouldDisplayByDepartementBtn: boolean
}) => {
    return (
        <ul className="fr-btns-group fr-btns-group--inline-sm">
            {millesimes_by_index.map((m) => (
                <li key={m.years}>
                    <button 
                        type="button" 
                        className={`fr-btn ${m.index !== index ? 'fr-btn--tertiary': ''}`} 
                        onClick={() => setIndex(m.index)}
                    >
                        {m.years}
                    </button>
                </li>
            ))}
            
            {shouldDisplayByDepartementBtn && (
                <li>
                    <button 
                        onClick={(e) => setByDepartement(!byDepartement)}
                        type="button" 
                        className="fr-btn fr-btn--tertiary"
                    >
                        <p>
                            <span>
                                {byDepartement ? 'Afficher par groupe de millésime' : 'Afficher par département'}
                            </span>
                            &nbsp;
                            <i 
                                className="bi bi-info-circle" 
                                aria-describedby="tooltip-multi-dpt" 
                                data-fr-js-tooltip-referent="true"
                            />
                            <span 
                                className="fr-tooltip fr-placement" 
                                role="tooltip" 
                                aria-hidden="true" 
                                id="tooltip-multi-dpt" 
                                data-fr-js-tooltip="true"
                            >
                                Les données OCS GE disponibles pour les départements qui composent votre territoire (77 et 91)
                                ont des millésimes différents.
                                <br />
                                Par défaut les millésimes sont affichés par groupe de millésime comparables (2017/2018 et 2021).
                                <br />
                                Cet option vous permet de visualiser les données par département, 
                                de manière à afficher chaque millésime séparément.
                            </span>
                        </p>
                    </button>
                </li>
            )}
        </ul>
    );
};

export const Artificialisation = ({ projectData, landData }: {
    projectData: ProjectDetailResultType,
    landData: LandDetailResultType,
}) => {
    const { land_id, land_type } = projectData;
    const { surface, surface_artif, percent_artif, millesimes_by_index, millesimes, years_artif, child_land_types } = landData || {};

    const defaultStockIndex = millesimes_by_index.length > 0 ? Math.max(...millesimes_by_index.map(e => e.index)) : 2;

    const [ stockIndex, setStockIndex ] = React.useState(defaultStockIndex)
    const [ byDepartement, setByDepartement ] = React.useState(false)
    const [ childLandType, setChildLandType ] = React.useState(child_land_types? child_land_types[0] : undefined)

    const shouldDisplayByDepartementBtn = millesimes_by_index.length != millesimes.length

    const { data : artifZonageIndex } = useGetArtifZonageIndexQuery({
        land_type: land_type,
        land_id: land_id,
        millesime_index: stockIndex
    });

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-mb-7w">
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12">
                        <Guide
                            title="Qu'est-ce que l'artificialisation des sols ?"
                            contentHtml={`
                                <p>L'artificialisation est définie dans l'article 192 de la loi Climat et Resilience comme "<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol, en particulier de ses fonctions biologiques, hydriques et climatiques</strong>, ainsi que de son potentiel agronomique par son occupation ou son usage." Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.</p>
                                <p>Sur la décennie 2011-2021, <strong>24 000 ha d'espaces naturels, agricoles et forestiers ont été artificialisés chaque année en moyenne en France</strong>, soit près de 5 terrains de football par heure. Ce processus se poursuit à un rythme quatre fois supérieur à celui de l'augmentation de la population.</p>
                            `}
                            DrawerTitle="Qu'est-ce que l'artificialisation des sols ?"
                            DrawerContentHtml={`
                                <p class="fr-text--sm mb-3">
                                    L'article 192 de la Loi Climat & Résilience votée en août 2021 définit
                                    l'artificialisation comme « une surface dont les sols sont :
                                </p>
                                <ul class="fr-text--sm mb-3">
                                    <li>soit imperméabilisés en raison du bâti ou d'un revêtement,</li>
                                    <li>soit stabilisés et compactés,</li>
                                    <li>soit constitués de matériaux composites »</li>
                                </ul>
                                <p class="fr-text--sm mb-3">Elle se traduit dans l'OCS GE nationale comme la somme des  objets anthropisés dans la description de la couverture des sols.</p>
                                <p class="fr-text--sm mb-3">L'application applique ici un croisement des données de l'OCS GE pour définir l'artificialisation conformément aux attendus de la loi Climat & Résilience, et au décret « nomenclature de l'artificialisation des sols» <a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045727061">(Décret n° 2022-763 du 29 avril 2022 relatif à la nomenclature de l'artificialisation des sols pour la fixation et le suivi des objectifs dans les documents de planification et d'urbanisme)</a>.</p>
                                <p class="fr-text--sm mb-3"><strong>Définition de l'artificialisation des sols</strong></p>
                                <p class="fr-text--sm mb-3">La nomenclature précise que les surfaces dont les sols sont soit imperméabilisés en raison du bâti ou d'un revêtement, soit stabilisés et compactés, soit constitués de matériaux composites sont qualifiées de surfaces artificialisées. De même, les surfaces végétalisées herbacées (c'est-à-dire non ligneuses) et qui sont à usage résidentiel, de production secondaire ou tertiaire, ou d'infrastructures, sont considérées comme artificialisées, y compris lorsqu'elles sont en chantier ou à l'état d'abandon.</p>
                                <p class="fr-text--sm mb-3">L'artificialisation nette est définie comme « le solde de l'artificialisation et de la désartificialisation des sols constatées sur un périmètre et sur une période donnés » (article L.101-2-1 du code de l'urbanisme). </p>
                                <p class="fr-text--sm mb-3">Au niveau national, l'artificialisation est mesurée par l'occupation des sols à grande échelle (OCS GE), en cours d'élaboration, dont la production sera engagée sur l'ensemble du territoire national d'ici fin 2024.</p>
                                <img src="${OcsgeMatricePassage}" alt="OCS GE Nomenclature Us" class="w-100" />
                            `}
                        />
                    </div>
                </div>
                <div className="bg-white fr-p-4w rounded">
                    <h6>Quels sont les objectifs nationaux de réduction de l'artificialisation ?</h6>
                    <div className="fr-highlight fr-highlight--no-margin">
                        <p className="fr-text--sm">Afin de préserver les sols naturels, agricoles et forestiers, la loi <strong>Climat et Résilience</strong> fixe à partir de 2031 un cap clair : atteindre l'équilibre entre les surfaces artificialisées et désartificialisées, c'est-à-dire un objectif de « zéro artificialisation nette » des sols, à horizon 2050.</p>
                    </div>
                </div>
            </div>
            <h2>Artificialisation des sols du territoire en {years_artif}</h2>
            <div className="fr-mb-7w">
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-lg-8">
                        <div className="bg-white fr-p-2w h-100 rounded">
                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-7">
                                    <ArtifPercentRateChart
                                        id="artif_percent_rate"
                                        land_id={land_id}
                                        land_type={land_type}
                                        index={defaultStockIndex}
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-md-5">
                                    <SurfaceArtif className="fr-mt-5w">{Math.round(surface_artif * 100) / 100} ha</SurfaceArtif>
                                    <span className="fr-badge fr-badge--error fr-badge--sm fr-badge--no-icon">+ 34 ha <i className="bi bi-arrow-up-right fr-ml-1w"></i>&nbsp;</span>
                                    <PercentArtif className="fr-mt-3w">{Math.round(percent_artif * 100) / 100}%</PercentArtif>
                                    <p>du territoire</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fr-col-12 fr-col-lg-4">
                        <Guide
                            title="Comprendre les données"
                            contentHtml={`
                                <p>En ${years_artif}, sur le territoire de Palaiseau, <strong>${Math.round(surface_artif * 100) / 100} ha</strong> étaient artificialisés, ce qui correspond à <strong>${Math.round(percent_artif * 100) / 100}%</strong> de la surface totale (${Math.round(surface * 100) / 100} ha) du territoire.</p>
                                <p>La surface artificialisée a augmenté de <strong>1000 ha depuis 2018</strong>.</p>
                            `}
                            column
                        />
                    </div>
                </div>
                <div className="bg-white fr-p-4w rounded fr-mt-5w">
                    <h6>D'où provient la donnée ?</h6>
                    <div className="fr-highlight fr-highlight--no-margin">
                        <p className="fr-text--sm">La mesure de l'artificialisation d'un territoire repose sur la donnée d'Occupation du Sol à Grande Echelle (OCSGE) en cours de production par l'IGN. Cette donnée est millésimée et produite département par département tous les 3 ans (calendrier de production). Elle repose sur l'utilisation de méthode innovantes de télédection (deep learning) et sur l'exploitation de données exogènes telles que les fichiers fonciers.</p>
                    </div>
                    <div className="fr-alert fr-alert--info">
                        <p>Le territoire de <strong>{projectData?.territory_name}</strong> dispose de {millesimes.length} millésimes OCS GE: {millesimes_by_index.map((m) => (
                            <span key={m.years} className="fr-tag fr-mr-1v">{m.years}</span>
                        ))}</p>
                    </div>
                </div>
            </div>
            <div className="fr-mb-7w">
                <h2>Répartition des surfaces artificialisées par type de couverture et d'usage</h2>
                <div className="bg-white fr-p-4w rounded">
                    <OcsgeMillesimeSelector
                        millesimes_by_index={millesimes_by_index}
                        index={stockIndex}
                        setIndex={setStockIndex}
                        byDepartement={byDepartement}
                        setByDepartement={setByDepartement}
                        shouldDisplayByDepartementBtn={shouldDisplayByDepartementBtn}
                    />
                    <div className="fr-grid-row fr-grid-row--gutters">
                        {byDepartement ? millesimes.filter(e => e.index === stockIndex).map(
                            (m) => (
                                <div key={`${m.index}_${m.departement}`} className={`fr-col-${Math.round(12 / millesimes_by_index.length)}`}>
                                    <OcsgeGraph
                                        id="pie_artif_by_couverture"
                                        land_id={land_id}
                                        land_type={land_type}
                                        params={{
                                            index: m.index,
                                            departement: m.departement,
                                        }}
                                    />
                                    <OcsgeGraph
                                        id="pie_artif_by_usage"
                                        land_id={land_id}
                                        land_type={land_type}
                                        params={{
                                            index: m.index,
                                            departement: m.departement,
                                        }}
                                    />
                                </div>
                            )
                        ) : (
                            <>
                                <div className="fr-col-12 fr-col-lg-6">
                                    <OcsgeGraph
                                        id="pie_artif_by_couverture"
                                        land_id={land_id}
                                        land_type={land_type}
                                        params={{
                                            index: stockIndex,
                                        }}
                                    />
                                </div>
                                <div className="fr-col-12 fr-col-lg-6">
                                    <OcsgeGraph
                                        id="pie_artif_by_usage"
                                        land_id={land_id}
                                        land_type={land_type}
                                        params={{
                                            index: stockIndex,
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {child_land_types && (
            <div className="fr-mb-7w">
                <h2>Proportion des sols artificialisés</h2>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-lg-8">
                        <div className="bg-white fr-p-2w h-100 rounded">
                            {child_land_types.length > 1 && (
                                child_land_types.map(child_land_type => (
                                    <button
                                        className={`fr-btn  ${childLandType === child_land_type ? 'fr-btn--primary' : 'fr-btn--tertiary'}`}
                                        key={child_land_type}
                                        onClick={() => setChildLandType(child_land_type)}>{child_land_type}
                                    </button>
                                ))
                            )}
                            <OcsgeGraph
                                isMap
                                id="artif_map"
                                land_id={land_id}
                                land_type={land_type}
                                params={{
                                    index: stockIndex,
                                    child_land_type: childLandType,
                                }}
                            />
                        </div>
                    </div>
                    <div className="fr-col-12 fr-col-lg-4">
                        <Guide
                            title="Comprendre les données"
                            contentHtml={`
                                <p>Cette carte permet de visualiser la proportion de sols artificialisés sur un territoire, représentée par l’intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols artificialisés est élevée.</p>
                                <p>L’évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d’artificialisation. La couleur des cercles indique le sens de ce flux : vert pour une désartificialisation nette, rouge pour une artificialisation nette.</p>
                            `}
                            column
                        />
                    </div>
                </div>
            </div>
            )}
            <div className="fr-mb-7w">
                <h2>Carte des sols artificialisés</h2>
                <div className="bg-white fr-p-4w rounded">
                    <p className="fr-text--sm">Cette cartographie permet d'explorer les couvertures et les usages des surfaces artificialisées du territoire, en fonction des millésimes disponibles de la donnée OCSGE. </p>
                    {projectData && <OcsgeMapContainer projectData={projectData} landData={landData} globalFilter={["==", ["get", "is_artificial"], true]} />}
                </div>
            </div>
            <div className="bg-white fr-p-4w fr-mb-7w rounded">
                <h6>Calcul de l'artificialisation des sols</h6>
                <p className="fr-text--sm">La mesure de l'artificialisation des sols est définie dans l'article xxx de la Loi Climat et Résilience ainsi que dans le décret du 27 novembre 2023. </p>
                <p className="fr-text--sm">Elle est obtenue à partir de la donnée OCSGE, en s'appuyant en particulier sur un tableau de croisement couverture / usage. Par exemple, les zones bâties à usage résidentiel ou les formations herbacées à usage tertaire sont considérées comme des surfaces artificialisées. L'ensemble des croisements d'usage et de couverture du sols définissant les espaces artificialisées est consultable dans la matrice OCSGE.</p>
                <div className="fr-highlight fr-highlight--no-margin">
                    <p className="fr-text--sm">Une fois les espaces qualifiés en artificiels ou non-artificiels, des seuils d'interprétation sont appliqués. Ceux-ci impliquent que des surfaces de moins de 2500m2 ne peuvent pas être comptabilisées comme artificialisées ou désartificialisées, à l'exception des espaces bâtis, qui sont considérés artificialisés quelle que soit leur surface.</p>
                </div>
                <p className="fr-text--sm">L'application de ces seuils permet de densifier en zone construite sans augmenter l'artificialisation du territoire concerné.</p>
                <p className="fr-text--sm fr-m-0">La mesure de l’artificialisation ne prend pas en compte, à ce stade, les exemptions facultatives citées dans le décret du 27 novembre 2023, c’est-à-dire :</p>
                <ul>
                    <li className="fr-text--sm fr-m-0">les surfaces végétalisées à usage de parc ou jardin public</li>
                    <li className="fr-text--sm fr-m-0">les surfaces végétalisées sur lesquelles seront implantées des installations de panneaux photovoltaîques.</li>
                </ul>
                <p className="fr-text--sm">Une donnée officelle prenant en compte ces exceptions est en cours de production par l’IGN. Plus d’informations ici :</p>
            </div>
            <div className="fr-mb-7w">
                <h2>Artificialisation des zonages d'urbanisme</h2>
                <div className="bg-white fr-p-4w rounded">
                    <p className="fr-text--sm">Ce tableau donne le détail de l’artificialisation du territoire en fonction des types de zonage d’urbanisme.</p>
                    <div className="fr-table fr-mb-0">
                        <div className="fr-table__wrapper">
                            <div className="fr-table__container">
                                <div className="fr-table__content">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th scope="col">Type de zonage</th>
                                                <th scope="col">Surface de zonage</th>
                                                <th scope="col">Surface artificialisée</th>
                                                <th scope="col">Taux d'artificialisation</th>
                                                <th scope="col">Nombre de zones</th>
                                                <th scope="col">Départements</th>
                                                <th scope="col">Années</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {artifZonageIndex?.toSorted((a, b) => b.zonage_surface - a.zonage_surface).map((a) => (
                                                <tr key={`${a.zonage_type}_${a.millesime_index}`}>
                                                    <td>{a.zonage_type}</td>
                                                    <td>{Math.round(a.zonage_surface / 10000)} ha</td>
                                                    <td>{Math.round(a.artificial_surface / 10000)} ha</td>
                                                    <td>{Math.round(a.artificial_percent * 100) / 100}%</td>
                                                    <td>{a.zonage_count}</td>
                                                    <td>{a.departements.join(', ')}</td>
                                                    <td>{a.years.join(', ')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="fr-notice fr-notice--warning">
                <div className="fr-container">
                    <div className="fr-notice__body">
                        <p>
                            <span className="fr-notice__title fr-text--sm">Certains indicateurs liés à l'évolution de l'artificialisation d'un millésime à l'autre ne sont pas encore disponibles sur Mon Diagnostic Artificialisation. </span>
                            <span className="fr-notice__desc fr-text--sm">En effet, ceux-ci reposent sur des données encore en cours de production. Leur publication est prévue dans les prochaines semaines.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};