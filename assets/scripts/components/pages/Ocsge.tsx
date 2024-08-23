import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';

const Ocsge: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/découvrir-l-ocsge`;
    const { content, loading, error } = useHtmlLoader(endpoint);

    useHighcharts([
        'chart_couv_pie',
        'chart_couv_prog',
        'chart_usa_pie',
        'chart_usa_prog',
        'chart_couv_wheel',
        'chart_usa_wheel'
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

export default Ocsge;