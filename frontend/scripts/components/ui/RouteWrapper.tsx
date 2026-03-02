import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import usePageTitle from '@hooks/usePageTitle';
import Feedback from '@components/ui/Feedback';

interface RouteWrapperProps {
    title: string;
    children: ReactNode;
    showPage?: boolean;
    showStatus?: boolean;
    status?: ReactNode;
    showTitle?: boolean;
    showFeedback?: boolean;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
    title,
    children,
    status = null,
    showPage = true,
    showStatus = false,
    showTitle = true,
    showFeedback = true,
}) => {
    const location = useLocation();

    usePageTitle(title);

    // Restaurer le scroll en haut de la page à chaque changement de route
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    if (!showTitle && !showStatus && showPage) {
        return (
            <>
                {children}
                {showFeedback && <Feedback />}
            </>
        );
    }

    return (
        <>
            <div className="fr-container--fluid fr-pt-3w fr-pl-3w fr-pr-3w fr-pb-1w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        {showTitle && <h1 className="fr-mb-1w">{title}</h1>}
                        {showStatus && <div className="fr-mt-5w fr-mb-2w">{status}</div>}
                    </div>
                </div>
            </div>
            
            {showPage && children}
            {showFeedback && <div className="fr-p-3w"><Feedback /></div>}
        </>
    );
};

export default RouteWrapper;
