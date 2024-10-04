import React, { ReactNode } from 'react';
import styled from 'styled-components';
import usePageTitle from '@hooks/usePageTitle';
import OcsgeStatus, { OcsgeStatusProps } from '@components/widgets/OcsgeStatus';
import GpuStatus from '@components/widgets/GpuStatus';

interface RouteWrapperProps {
    title: string;
    ocsgeStatus?: OcsgeStatusProps["status"];
    hasGpu?: boolean;
    children: ReactNode;
}

const Title = styled.h1`
    margin: 1rem 0 0 0;
    font-size: 1.8em;
`;

const RouteWrapper: React.FC<RouteWrapperProps> = ({ title, ocsgeStatus, hasGpu, children }) => {
    const shouldDisplayOcsgeStatus = ocsgeStatus && ocsgeStatus !== "COMPLETE_UNIFORM";
    const shouldDisplayGpuStatus = hasGpu === false;

    usePageTitle(title);

    return (
        <>
            <div className="fr-container--fluid fr-p-3w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        <Title>{title}</Title>

                        {/* Affichage conditionnel du statut OCS GE */}
                        {shouldDisplayOcsgeStatus && <OcsgeStatus status={ocsgeStatus} />}
                        
                        {/* Affichage conditionnel du statut GPU */}
                        {shouldDisplayGpuStatus && <GpuStatus />}
                    </div>
                </div>
            </div>
                
            {/* Affichage du contenu uniquement si les conditions d'OCS GE et GPU sont remplies */}
            {!shouldDisplayOcsgeStatus && !shouldDisplayGpuStatus && children}
        </>
    );
};

export default RouteWrapper;
