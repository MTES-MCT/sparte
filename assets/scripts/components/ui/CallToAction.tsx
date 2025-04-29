import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 6px;
  background-color: #ece4ff
`;

const Title = styled.h3`
  font-size: 0.9rem;
  color: #313178;
  margin-bottom: 0.5rem;
`;

const Text = styled.p`
  font-size: 0.8rem;
  line-height: 1.2rem;
  color: #313178;
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
      <Text>{text}</Text>
      {children}
    </Container>
  );
};

export default CallToAction;
