import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import EmptyState from './EmptyState';

const Container = styled.div`
    background: white;
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    max-width: 500px;
    margin: 48px auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const LoginLink = styled.a`
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    background: ${theme.button.primary.background};
    color: ${theme.button.primary.color};
    border-radius: ${theme.radius.default};
    text-decoration: none;

    &:hover {
        background: ${theme.colors.primaryHover};
    }
`;

const LoginPrompt: React.FC = () => {
    return (
        <Container>
            <EmptyState
                icon="📄"
                title="Rapports personnalisables"
                description="Connectez-vous pour créer des rapports personnalisés avec vos propres commentaires et analyses."
            >
                <LoginLink href="/users/signin/">
                    Se connecter
                </LoginLink>
            </EmptyState>
        </Container>
    );
};

export default LoginPrompt;

