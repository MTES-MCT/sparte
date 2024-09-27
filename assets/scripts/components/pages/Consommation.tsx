import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHtmx from '@hooks/useHtmx';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';
import Guide from '@components/widgets/Guide';

const Consommation: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/consommation`;
    const [refreshKey, setRefreshKey] = useState(0);
    const { content, isLoading, error } = useHtmlLoader(endpoint + `?refreshKey=${refreshKey}`);
    const htmxRef = useHtmx([isLoading]);

    useHighcharts([
        'annual_total_conso_chart',
        'comparison_chart',
        'chart_determinant',
        'pie_determinant',
        'surface_chart',
        'surface_proportional_chart'
    ], isLoading);

    useEffect(() => {
        const handleForceRefresh = () => {
            setRefreshKey(prevKey => prevKey + 1);
        };
    
        document.addEventListener('force-refresh', handleForceRefresh);
    
        return () => {
            document.removeEventListener('force-refresh', handleForceRefresh);
        };
    }, []);

    useEffect(() => {
        if (!isLoading && refreshKey !== 0) {
            const targetElement = document.getElementById('territoires-de-comparaison');
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 190;
            if (targetElement) {
                window.scrollTo({ top: targetPosition, behavior: 'instant' });
            }
        }
    }, [refreshKey, isLoading]);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;
      
    return (
        <div className="fr-container--fluid fr-p-3w w-100" ref={htmxRef}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Consommation d'espaces NAF"/>
                    <Guide
                        title="Cadre réglementaire"
                        contentHtml={`La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).`}
                        DrawerTitle="Cadre Réglementaire"
                        DrawerContentHtml={`
                            <p class="fr-text--sm mb-3">
                                La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme
                                <i>« la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »</i> (article 194 de la loi Climat et résilience).
                            </p>
                            <p class="fr-text--sm mb-3">
                                Cet article exprime le fait que le caractère urbanisé d'un espace est la traduction de l'usage qui en est fait.
                                Un espace urbanisé n'est plus un espace d'usage NAF (Naturel, Agricole et Forestier). Si l'artificialisation des sols traduit globalement un changement de couverture physique,
                                la consommation traduit un changement d'usage. A titre d'exemple, un bâtiment agricole artificialise mais ne consomme pas.
                            </p>
                            <p class="fr-text--sm mb-3">
                                La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est mesurée avec les données d'évolution des fichiers fonciers produits
                                et diffusés par le Cerema depuis 2009 à  partir des fichiers MAJIC (Mise A Jour de l'Information Cadastrale)
                                de la DGFIP. Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2023, intégrant
                                les évolutions réalisées au cours de l'année 2022.
                            </p>
                            <p class="fr-text--sm mb-3">
                                Les données de l'INSEE sont également intégrées pour mettre en perspective la consommation d'espaces vis à vis de l'évolution de la population.
                            </p>
                            <p class="fr-text--sm mb-3"><a href="https://artificialisation.developpement-durable.gouv.fr/bases-donnees/les-fichiers-fonciers" target="_blank" rel="noopener noreferrer">Plus d'informations sur les fichiers fonciers (source : Cerema)</a></p>
                        `}
                    />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Consommation;
