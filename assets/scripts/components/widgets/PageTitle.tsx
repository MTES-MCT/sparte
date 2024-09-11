import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface StatisticProps {
    title: string;
}

const Title = styled.h2`
    margin: 1rem 0 3rem 0;
`;

const PageTitle: React.FC<StatisticProps> = ({ title }) => {
    return (
        <Title>{title}</Title>
    );
};

export default PageTitle;
