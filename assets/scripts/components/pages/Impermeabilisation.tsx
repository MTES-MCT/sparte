import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';

const Impermeabilisation: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/impermeabilisation`;
    const { content, loading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'imper_nette_chart',
        'imper_progression_couv_chart',
        'imper_repartition_couv_chart',
        'imper_progression_usage_chart',
        'imper_repartition_usage_chart',
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

export default Impermeabilisation;