import React, { ReactNode } from 'react';
import styled from 'styled-components';
import usePageTitle from '@hooks/usePageTitle';
interface RouteWrapperProps {
    title: string;
    children: ReactNode;
    showPage?: boolean;
    showStatus?: boolean;
    status?: ReactNode;
}

const Title = styled.h1`
    margin: 1rem 0 0 0;
    font-size: 1.8em;
`;

const RouteWrapper: React.FC<RouteWrapperProps> = ({
    title,
    children,
    status = null,
    showPage = true,
    showStatus = false,
    
}) => {

    usePageTitle(title);

    return (
        <>
            <div className="fr-container--fluid fr-p-3w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        <Title>{title}</Title>
                        {showStatus && status}
                    </div>
                </div>
            </div>
            
            {showPage && children}
        </>
    );
};

export default RouteWrapper;
