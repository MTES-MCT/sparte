import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';

const Artificialisation: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/artificialisation`;
    const { content, loading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'detail_couv_artif_chart',
        'couv_artif_sol',
        'detail_usage_artif_chart',
        'usage_artif_sol',
        'chart_comparison',
        'chart_waterfall'
    ], loading);

    if (loading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Artificialisation;
