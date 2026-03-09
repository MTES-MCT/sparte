import React from 'react';
import styled from 'styled-components';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    children?: React.ReactNode;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    padding: 48px;
`;

const Icon = styled.div`
    font-size: 72px;
    opacity: 0.2;
    margin-bottom: 24px;
`;

const Title = styled.h2`
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
`;

const Description = styled.p`
    margin: 0 0 24px 0;
    color: #666;
    max-width: 400px;
`;

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📄',
    title,
    description,
    children,
}) => {
    return (
        <Container>
            <Icon>{icon}</Icon>
            <Title>{title}</Title>
            {description && <Description>{description}</Description>}
            {children}
        </Container>
    );
};

export default EmptyState;

