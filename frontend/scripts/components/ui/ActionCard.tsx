import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import IconBadge from "@components/ui/IconBadge";

interface ActionCardProps {
  icon?: string;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Card = styled(BaseCard)<{ $interactive: boolean; $disabled?: boolean }>`
border-radius: ${theme.radius.default};
  && {
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.colors.background};
    text-decoration: none;
    text-align: left;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
    border: 1px solid ${theme.colors.border};
    cursor: ${({ $interactive, $disabled }) => ($disabled ? "not-allowed" : $interactive ? "pointer" : "default")};
    opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
    transition: all 0.2s ease;
  }

  &&:hover {
    background: ${theme.colors.background};
    ${({ $interactive, $disabled }) =>
      $interactive && !$disabled &&
      `
        border-color: ${theme.colors.primary};
        box-shadow: ${theme.shadow.lg};
        transform: translateY(-2px);
      `}
  }
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

  const content = (
    <>
      {icon && <IconBadge icon={icon} />}
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
      <Card as={Link} to={to} $interactive>
        {content}
      </Card>
    );
  }

  if (onClick) {
    return (
      <Card as="button" onClick={disabled ? undefined : onClick} $interactive={interactive} $disabled={disabled} disabled={disabled}>
        {content}
      </Card>
    );
  }

  return <Card $interactive={false} $disabled={disabled}>{content}</Card>;
};

export default ActionCard;
