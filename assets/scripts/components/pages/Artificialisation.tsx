import React from 'react';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import Guide from '@components/widgets/Guide';

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Graphiques interactifs :
Le hook `useHighcharts` récupère les options des graphiques transmises par le contexte Django et les rend dynamiquement dans le contenu.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const Artificialisation: React.FC<{ endpoint: string }> = ({ endpoint }) => {
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'detail_couv_artif_chart',
        'couv_artif_sol',
        'detail_usage_artif_chart',
        'usage_artif_sol',
        'chart_comparison',
        'chart_waterfall'
    ], isLoading);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
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
                            <img src="https://mondiagartif.beta.gouv.fr/static/project/img/ocs_ge_matrice_passage.png" class="w-100" />
                        `}
                    />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Artificialisation;
