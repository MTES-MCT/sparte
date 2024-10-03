import React from 'react';
import usePageTitle from '@hooks/usePageTitle';

const RouteWrapper: React.FC<{ title: string, component: React.ReactNode }> = ({ title, component }) => {
    usePageTitle(title);

    return <>{component}</>;
};

export default RouteWrapper;
