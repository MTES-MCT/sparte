import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import usePageTitle from '@hooks/usePageTitle';
interface RouteWrapperProps {
    title: string;
    children: ReactNode;
    showPage?: boolean;
    showStatus?: boolean;
    status?: ReactNode;
    showTitle?: boolean;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
    title,
    children,
    status = null,
    showPage = true,
    showStatus = false,
    showTitle = true,
}) => {
    const location = useLocation();

    usePageTitle(title);

    // Restaurer le scroll en haut de la page à chaque changement de route
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    if (!showTitle && !showStatus && showPage) {
        return <>{children}</>;
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
        </>
    );
};

export default RouteWrapper;
