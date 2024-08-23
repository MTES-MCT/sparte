import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHtmx from '@hooks/useHtmx';
import useHighcharts from '@hooks/useHighcharts';
import Loader from '@components/ui/Loader';

const Trajectoires: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/trajectoires`;

    const [refreshKey, setRefreshKey] = useState(0);

    const { content, loading, error } = useHtmlLoader(endpoint + `?refreshKey=${refreshKey}`);
    const htmxRef = useHtmx([loading]);

    useHighcharts([
        'target_2031_chart'
    ], loading);

    useEffect(() => {
        const handleLoadGraphic = () => {
            setTimeout(() => {
                // Ferme la modal Bootstrap
                const modalElement = document.getElementById("setTarget");
                if (modalElement) {
                    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
                // Rafraîchit la clé après avoir fermé la modal pour recharger le contenu
                setRefreshKey(prevKey => prevKey + 1);
            }, 1800);
        };

        document.addEventListener('load-graphic', handleLoadGraphic);

        return () => {
            document.removeEventListener('load-graphic', handleLoadGraphic);
        };
    }, []);

    if (loading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Trajectoires;
