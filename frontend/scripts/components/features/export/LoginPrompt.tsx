import React from 'react';
import styled from 'styled-components';
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

const LoginPrompt: React.FC = () => {
    return (
        <Container>
            <EmptyState
                icon="📄"
                title="Rapports personnalisables"
                description="Connectez-vous pour créer des rapports personnalisés avec vos propres commentaires et analyses."
            >
                <a href="/users/signin/" className="fr-btn">
                    Se connecter
                </a>
            </EmptyState>
        </Container>
    );
};

export default LoginPrompt;

