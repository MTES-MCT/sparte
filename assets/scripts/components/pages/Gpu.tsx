import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';

const Synthese: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/zonages-d-urbanisme`;
    const { content, loading, error } = useHtmlLoader(endpoint);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div>
            {/* Autres composants React */}
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default Synthese;