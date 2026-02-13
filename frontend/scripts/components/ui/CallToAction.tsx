import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';

const Container = styled(BaseCard)`
  padding: ${theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const Text = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  line-height: 1.7;
  margin-bottom: ${theme.spacing.md};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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
      {children && <Actions>{children}</Actions>}
    </Container>
  );
};

export default CallToAction;
