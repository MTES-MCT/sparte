import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';

const Consommation: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/consommation`;
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'annual_total_conso_chart',
        'comparison_chart',
        'chart_determinant',
        'pie_determinant',
        'surface_chart',
        'surface_proportional_chart'
    ], isLoading);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

      
    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Évolutions foncières (ENAF)"/>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Consommation;