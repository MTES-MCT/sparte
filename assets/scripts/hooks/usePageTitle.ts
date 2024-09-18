import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: { [key: string]: string } = {
    '/project/:projectId/tableau-de-bord/synthesis': 'Synthèse',
    '/project/:projectId/tableau-de-bord/consommation': 'Consommation d\'espaces NAF',
    '/project/:projectId/tableau-de-bord/trajectoires': 'Trajectoire ZAN',
    '/project/:projectId/tableau-de-bord/découvrir-l-ocsge': 'Usage et couverture du sol (OCS GE)',
    '/project/:projectId/tableau-de-bord/artificialisation': 'Artificialisation',
    '/project/:projectId/tableau-de-bord/impermeabilisation': 'Impermeabilisation',
    '/project/:projectId/tableau-de-bord/zonages-d-urbanisme': 'Artificialisation des zonages d\'urbanisme',
    '/project/:projectId/tableau-de-bord/rapport-local': 'Rapport triennal local',
    '/project/:projectId/edit': 'Paramètres du diagnostic',
};

const usePageTitle = (): void => {
    const location = useLocation();

    useEffect(() => {
        const currentPath = location.pathname;

        const projectIdMatch = currentPath.match(/\/project\/([^\/]+)\//);
        const projectId = projectIdMatch ? projectIdMatch[1] : '';

        const pageTitle = Object.keys(pageTitles).find(path =>
            currentPath.includes(path.replace(':projectId', projectId))
        );
        
        document.title = pageTitle ? `${pageTitles[pageTitle]} | Mon Diagnostic Artificialisation` : 'Mon Diagnostic Artificialisation';
    }, [location]);
};

export default usePageTitle;
