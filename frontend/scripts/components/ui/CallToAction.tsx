import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import BaseCard from '@components/ui/BaseCard';

interface Action {
  label: string;
  to: string;
}

interface CallToActionProps {
  title: string;
  text: string;
  actions?: Action[];
  className?: string;
}

const Container = styled(BaseCard)`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  line-height: 1.3;
`;

const Text = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
  line-height: 1.7;
  margin: 0 0 ${theme.spacing.md} 0;
  opacity: 0.85;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CallToAction: React.FC<CallToActionProps> = ({ title, text, actions, className }) => {
  return (
    <Container className={className}>
      <Title>{title}</Title>
      <Text>{text}</Text>
      {actions && actions.length > 0 && (
        <Actions>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="primary"
              to={action.to}
              icon="bi bi-arrow-right"
              iconPosition="right"
            >
              {action.label}
            </Button>
          ))}
        </Actions>
      )}
    </Container>
  );
};

export default CallToAction;
