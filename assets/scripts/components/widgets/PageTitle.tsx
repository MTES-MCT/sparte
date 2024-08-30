import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface StatisticProps {
    title: string;
}

const Title = styled.h2`
    font-size: 1.5em;
    color: #2B3674;
    margin-bottom: 2rem;
`;

const PageTitle: React.FC<StatisticProps> = ({ title }) => {
    return (
        <Title>{title}</Title>
    );
};

export default PageTitle;
