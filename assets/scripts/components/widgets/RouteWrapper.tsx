import React, { ReactNode } from 'react';
import styled from 'styled-components';
import usePageTitle from '@hooks/usePageTitle';
import OcsgeStatus, { OcsgeStatusProps } from '@components/widgets/OcsgeStatus';
import GpuStatus from '@components/widgets/GpuStatus';
import LogementVacantStatus from '@components/widgets/LogementVacantStatus';
import ConsoCorrectionStatus, { ConsoCorrectionStatusEnum} from '@components/widgets/ConsoCorrectionStatus';


interface RouteWrapperProps {
    title: string;
    ocsgeStatus?: OcsgeStatusProps["status"];
    consoCorrectionStatus?: ConsoCorrectionStatusEnum;
    hasGpu?: boolean;
    hasLogementVacant?: boolean;
    children: ReactNode;
}

const Title = styled.h1`
    margin: 1rem 0 0 0;
    font-size: 1.8em;
`;

const RouteWrapper: React.FC<RouteWrapperProps> = ({
    title,
    ocsgeStatus,
    hasGpu,
    consoCorrectionStatus,
    hasLogementVacant,
    children,
}) => {
    const shouldDisplayOcsgeStatus = ocsgeStatus !== undefined && ocsgeStatus !== "COMPLETE_UNIFORM";
    const shouldDisplayGpuStatus = hasGpu !== undefined && hasGpu === false;
    const shouldDisplayConsoCorrectionStatus = consoCorrectionStatus !== undefined && consoCorrectionStatus !== ConsoCorrectionStatusEnum.UNCHANGED;
    const shouldDisplayConsoChildren = consoCorrectionStatus === undefined || [
        ConsoCorrectionStatusEnum.UNCHANGED,
        ConsoCorrectionStatusEnum.FUSION
    ].includes(consoCorrectionStatus);
    const shouldDisplayLogementVacantStatus = hasLogementVacant !== undefined && hasLogementVacant === false;

    const shouldDisplayChildren = !shouldDisplayOcsgeStatus &&
        !shouldDisplayGpuStatus &&
        !shouldDisplayLogementVacantStatus &&
        shouldDisplayConsoChildren;

    usePageTitle(title);

    return (
        <>
            <div className="fr-container--fluid fr-p-3w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        <Title>{title}</Title>
                        {shouldDisplayOcsgeStatus && <OcsgeStatus status={ocsgeStatus} />}
                        {shouldDisplayGpuStatus && <GpuStatus />}
                        {shouldDisplayConsoCorrectionStatus && <ConsoCorrectionStatus status={consoCorrectionStatus} />}
                        {shouldDisplayLogementVacantStatus && <LogementVacantStatus />}
                    </div>
                </div>
            </div>
                
            {shouldDisplayChildren && children}
        </>
    );
};

export default RouteWrapper;
