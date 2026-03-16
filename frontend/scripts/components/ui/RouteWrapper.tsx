import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import usePageTitle from '@hooks/usePageTitle';
import Feedback, { FeedbackContext } from '@components/ui/Feedback';

const PageLayout = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const PageContent = styled.div`
    flex: 1;
    min-height: calc(100vh - 280px);
`;

export interface FeedbackLandData {
    land_type: string;
    land_id: string;
    name: string;
}

interface RouteWrapperProps {
    title: string;
    children: ReactNode;
    showPage?: boolean;
    showStatus?: boolean;
    status?: ReactNode;
    showTitle?: boolean;
    showFeedback?: boolean;
    landData?: FeedbackLandData;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
    title,
    children,
    status = null,
    showPage = true,
    showStatus = false,
    showTitle = true,
    showFeedback = true,
    landData,
}) => {
    const location = useLocation();

    usePageTitle(title);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    const feedbackContext: FeedbackContext = {
        pageName: title,
        landType: landData?.land_type ?? '',
        landId: landData?.land_id ?? '',
        landName: landData?.name ?? '',
    };

    if (!showTitle && !showStatus && showPage) {
        return (
            <PageLayout>
                <PageContent>{children}</PageContent>
                {showFeedback && <Feedback context={feedbackContext} />}
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="fr-container--fluid fr-pt-3w fr-pl-3w fr-pr-3w fr-pb-1w">
                <div className="fr-grid-row">
                    <div className="fr-col-12">
                        {showTitle && <h1 className="fr-mb-1w">{title}</h1>}
                        {showStatus && <div className="fr-mt-5w fr-mb-2w">{status}</div>}
                    </div>
                </div>
            </div>
            <PageContent>{showPage && children}</PageContent>
            {showFeedback && <div className="fr-p-3w"><Feedback context={feedbackContext} /></div>}
        </PageLayout>
    );
};

export default RouteWrapper;
