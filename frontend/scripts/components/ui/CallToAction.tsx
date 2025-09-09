import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 6px;
  background-color: #fff;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Text = styled.p`
  margin-bottom: 1rem;
`;


interface CallToActionProps {
  title: string;
  text: string;
  children?: ReactNode;
}

const CallToAction: React.FC<CallToActionProps> = ({ title, text, children }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Text className="fr-text--sm">{text}</Text>
      {children}
    </Container>
  );
};

export default CallToAction;
