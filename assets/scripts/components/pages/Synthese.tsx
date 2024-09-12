import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';

const Synthese: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/synthesis`;
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Synthèse" />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Synthese;
