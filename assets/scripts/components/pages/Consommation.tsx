import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHtmx from '@hooks/useHtmx';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';

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
        <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Consommation d'Espaces Naturels, Agricoles et Forestiers"/>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Consommation;