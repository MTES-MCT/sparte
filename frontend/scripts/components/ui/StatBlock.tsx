import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import IconBadge from "@components/ui/IconBadge";

interface StatBlockProps {
  icon: string;
  label: string;
  children: ReactNode;
}

const Card = styled(BaseCard)`
  padding: ${theme.spacing.md} 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Label = styled.span`
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
  margin-bottom: 0.2rem;
`;

export const Value = styled.div`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  line-height: 1.2;

  span {
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.textLight};
    margin-left: 0.15rem;
  }
`;

export const Secondary = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textLight};
  margin-top: 0.2rem;
`;

const StatBlock: React.FC<StatBlockProps> = ({ icon, label, children }) => (
  <Card>
    <IconBadge icon={icon} />
    <Content>
      <Label>{label}</Label>
      {children}
    </Content>
  </Card>
);

export default StatBlock;
