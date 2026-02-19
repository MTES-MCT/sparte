import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";

interface ActionCardProps {
  icon?: string;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Card = styled(BaseCard)<{ $disabled: boolean; $interactive: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: white;
  text-decoration: none;
  text-align: left;
  width: 100%;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid ${theme.colors.border};
  cursor: ${({ $interactive, $disabled }) =>
    $disabled ? "not-allowed" : $interactive ? "pointer" : "default"};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover {
    background: white;
    ${({ $interactive, $disabled }) =>
      $interactive &&
      !$disabled &&
      `
        border-color: ${theme.colors.primary};
        box-shadow: ${theme.shadow.lg};
        transform: translateY(-2px);
      `}
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.span`
  display: block;
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
  margin-bottom: 0.25rem;
`;

const CardDescription = styled.span`
  display: block;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  line-height: 1.5;
`;

const Arrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  color: ${theme.colors.primary};
  font-size: 1rem;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.2s ease;

  ${Card}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  to,
  onClick,
  disabled = false,
}) => {
  const interactive = !!(to || onClick) && !disabled;

  const commonProps = {
    $disabled: disabled,
    $interactive: interactive,
  };

  const content = (
    <>
      {icon && (
        <IconWrapper>
          <i className={icon} aria-hidden="true" />
        </IconWrapper>
      )}
      <Content>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </Content>
      {interactive && (
        <Arrow>
          <i className="bi bi-arrow-right" />
        </Arrow>
      )}
    </>
  );

  if (to && !disabled) {
    return (
      <Card as={Link} to={to} {...commonProps}>
        {content}
      </Card>
    );
  }

  if (onClick) {
    return (
      <Card as="button" onClick={onClick} disabled={disabled} {...commonProps}>
        {content}
      </Card>
    );
  }

  return <Card {...commonProps}>{content}</Card>;
};

export default ActionCard;

