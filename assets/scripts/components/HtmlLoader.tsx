import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const HtmlLoader: React.FC<{ endpoint: string }> = ({ endpoint }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const serverRenderedContent = document.getElementById('server-rendered-content');
        if (serverRenderedContent) {
            setHtmlContent(serverRenderedContent.innerHTML);
            setLoading(false);
        } else {
            setLoading(true);
            fetch(endpoint.replace(':projectId', projectId || ''), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.text())
            .then(data => {
                setHtmlContent(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching HTML:', error);
                setLoading(false);
            });
        }
    }, [endpoint, projectId]);

    return (
        <div>
            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
        </div>
    );
};

export default HtmlLoader;