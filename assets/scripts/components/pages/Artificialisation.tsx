import React from 'react';
import Guide from '@components/widgets/Guide';
import OcsgeMatricePassage from '@images/ocsge_matrice_passage.png';
import { LandDetailResultType, MillesimeByIndex, ProjectDetailResultType } from '@services/api';
import { OcsgeGraph } from '@components/charts/ocsge/OcsgeGraph';


const ArtificialisationGuide  = () => (
    <div className="fr-grid-row">
    <div className="fr-col-12">
        <Guide
            title="Cadre réglementaire"
            contentHtml={`L'article 192 de la Loi Climat & Résilience votée en août 2021 définit l'artificialisation comme « une surface dont les sols sont :
                <ul>
                    <li>soit imperméabilisés en raison du bâti ou d'un revêtement,</li>
                    <li>soit stabilisés et compactés,</li>
                    <li>soit constitués de matériaux composites »</li>
                </ul>
            `}
            DrawerTitle="Cadre Réglementaire"
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
)

type TriptiqueProps = {
    surface: number;
    surfaceArtif: number;
    percentArtif: number;
    yearsArtif: number[]
}

const Triptique = ({ surface, surfaceArtif, percentArtif, yearsArtif }: TriptiqueProps) => (
    <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-4 fr-grid-row">
                <div className="fr-callout bg-white w-100">
                <p className="fr-callout__title">&nbsp;{Math.round(surface * 100) / 100} ha</p>
                <p>Surface du territoire</p>
                </div>
            </div>
            <div className="fr-col-12 fr-col-md-4 fr-grid-row">
                <div className="fr-callout bg-white w-100">
                <p className="fr-callout__title">&nbsp;{Math.round(surfaceArtif * 100) / 100} ha</p>
                <p>
                    <i className="bi bi-info-circle" aria-describedby="tooltip-artif-last-millesime" data-fr-js-tooltip-referent="true"></i>
                    <span className="fr-tooltip fr-placement" id="tooltip-artif-last-millesime" role="tooltip" aria-hidden="true" data-fr-js-tooltip="true">
                        Surfaces répondant à la définition de la loi Climat et Résilience et à ses décrets d'application en 2019
                    </span>&nbsp;Surfaces artificialisées en {yearsArtif.join(', ')}
                </p>
                </div>
            </div>
            <div className="fr-col-12 fr-col-md-4 fr-grid-row">
                <div className="fr-callout bg-white w-100">
                <p className="fr-callout__title">{Math.round(percentArtif * 100) / 100}%</p>
                <p>Taux de surfaces artificialisées  en {yearsArtif.join(', ')}</p>
                </div>
            </div>
        </div>
)


export const OcsgeMillesimeSelector = ({ index, setIndex, byDepartement, setByDepartement, millesimes_by_index } : {
    index: number, setIndex: (index: number) => void, byDepartement: boolean, setByDepartement: (byDepartement: boolean) => void , millesimes_by_index: MillesimeByIndex[]}) => {

    return (
        <ul className="fr-btns-group fr-btns-group--inline-sm">
            {millesimes_by_index.map((m) => (
                <li key={m.years}>
                    <button type="button" className={`fr-btn ${m.index !== index ? 'fr-btn--tertiary': ''}`} onClick={() => setIndex(m.index)}>
                        {m.years}
                    </button>
                </li>
            ))}
            <li><button onClick={() => setByDepartement(!byDepartement)} type="button" className="fr-btn fr-btn--tertiary">
                
                <p>

                <span>{byDepartement ? 'Afficher par groupe de millésime' : 'Afficher par département'}</span>&nbsp;
                <i className="bi bi-info-circle" aria-describedby="tooltip-multi-dpt" data-fr-js-tooltip-referent="true"></i>
                <span className="fr-tooltip fr-placement" role="tooltip" aria-hidden="true" id="tooltip-multi-dpt" data-fr-js-tooltip="true">
                    Les données OCS GE disponibles pour les départements qui composent votre territoire (77 et 91)
                    ont des millésimes différents.
                    <br />
                    Par défaut les millésimes sont affichés par groupe de millésime comparables (2017/2018 et 2021).
                    <br />
                    Cet option vous permet de visualiser les données par département, 
                    de manière à afficher chaque millésime séparément.
                </span>
            </p>
            </button></li>
        </ul>
    )
}


export const Artificialisation = ({ projectData, landData }: {
    projectData: ProjectDetailResultType,
    landData: LandDetailResultType,
}) => {
    const { land_id, land_type } = projectData;
    const { surface, surface_artif, percent_artif, millesimes_by_index, millesimes, years_artif } = landData || {};

    const [ stockIndex, setStockIndex ] = React.useState(2)
    const [ byDepartement, setByDepartement ] = React.useState(false)

    return (
        <div className="fr-container--fluid fr-p-3w">
            <ArtificialisationGuide />
            <h2>Etat des lieux du territoire au dernier millésime</h2>
            <Triptique
                surface={surface}
                surfaceArtif={surface_artif}
                percentArtif={percent_artif}
                yearsArtif={years_artif}
            />
            <OcsgeGraph
                id="bar_artif_stock"
                land_id={land_id}
                land_type={land_type}
                index={stockIndex}
            />
            <br />
            <OcsgeMillesimeSelector
                millesimes_by_index={millesimes_by_index}
                index={stockIndex}
                setIndex={setStockIndex}
                byDepartement={byDepartement}
                setByDepartement={setByDepartement}
            />
            <div className="fr-grid-row">
            {byDepartement ? millesimes.filter(e => e.index === stockIndex).map(
                (m) => (
                    <div key={`${m.index}_${m.departement}`} className="fr-col-4">
                        <OcsgeGraph
                            id="pie_artif_by_couverture"
                            index={m.index}
                            land_id={land_id}
                            land_type={land_type}
                            departement={m.departement}
                        />
                         <OcsgeGraph
                            id="pie_artif_by_usage"
                            index={m.index}
                            land_id={land_id}
                            land_type={land_type}
                            departement={m.departement}
                        />
                    </div>
                )
            ) : (
                <div className="fr-col-12">
                <OcsgeGraph
                    id="pie_artif_by_couverture"
                    index={stockIndex}
                    land_id={land_id}
                    land_type={land_type}
                />
                                <OcsgeGraph
                    id="pie_artif_by_usage"
                    index={stockIndex}
                    land_id={land_id}
                    land_type={land_type}
                />
                </div>
            )}
            </div>
        </div>
    );
};