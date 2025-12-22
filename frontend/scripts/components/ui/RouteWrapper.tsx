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

const Title = styled.h1`
    margin: 1rem 0 0 0;
`;

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
            <div className="fr-container--fluid fr-p-3w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        {showTitle && <Title>{title}</Title>}
                        {showStatus && status}
                    </div>
                </div>
            </div>
            
            {showPage && children}
        </>
    );
};

export default RouteWrapper;
