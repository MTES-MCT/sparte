import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';
import Guide from '@components/widgets/Guide';

const Ocsge: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/découvrir-l-ocsge`;
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'chart_couv_pie',
        'chart_couv_prog',
        'chart_usa_pie',
        'chart_usa_prog',
        'chart_couv_wheel',
        'chart_usa_wheel'
    ], isLoading);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Usage et couverture du sol (OCS GE)" />
                    <Guide
                        title="Cadre réglementaire"
                        contentHtml={`L'OCS GE est une base de données vectorielle pour la description de l'occupation du sol de l'ensemble du territoire métropolitain et des départements et régions d'outre-mer (DROM). Elle est un référentiel national, constituant un socle national, utilisable au niveau national et au niveau local notamment pour contribuer aux calculs d'indicateurs exigés par les documents d'urbanisme.`}
                        DrawerTitle="Cadre Réglementaire"
                        DrawerContentHtml={`
                            <p class="fr-text--sm mb-3">Au niveau national, l'artificialisation est mesurée par l'occupation des sols à grande échelle (OCS GE), en cours d'élaboration, dont la production sera engagée sur l'ensemble du territoire national d'ici fin 2024.</p>
                            <p class="fr-text--sm mb-3">L'OCS GE est une base de données vectorielle pour la description de l'occupation du sol de l'ensemble du territoire métropolitain et des départements et régions d'outre-mer (DROM). Elle est un référentiel national, constituant un socle national, utilisable au niveau national et au niveau local notamment pour contribuer aux calculs d'indicateurs exigés par les documents d'urbanisme. Elle s'appuie sur un modèle ouvert séparant la couverture du sol et l'usage du sol (appelé modèle en 2 dimensions), une précision géométrique appuyée sur le Référentiel à Grande Échelle (RGE®) et une cohérence temporelle (notion de millésime) qui, par le biais de mises à jour à venir, permettra de quantifier et de qualifier les évolutions des espaces.</p>
                            <p class="fr-text--sm mb-3">La couverture du sol est une vue « physionomique » du terrain. La description est une simple distinction des éléments structurant le paysage. Ex : Zones bâties.</p>
                            <p class="fr-text--sm mb-3">L'usage du sol est une vue « anthropique du sol ». Il est  partagé en fonction du rôle que jouent les portions de terrain en tant  qu'occupation humaine. Dans l'OCS GE, l'usage US235 regroupe les objets de US2  (production secondaire), US3 (production tertiaire) et US5 (usage  résidentiel) de la nomenclature nationale quand la distinction entre ces usages n'est pas possible ou pas connue. Ex : Agriculture.</p>
                            <p class="fr-text--sm mb-3">Chaque objet géographique de l'OCS GE porte ces deux informations. Ex : Zones bâties (couverture) et Agriculture (usage) décrivent des bâtiments agricoles.</p>
                        `}
                    />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Ocsge;