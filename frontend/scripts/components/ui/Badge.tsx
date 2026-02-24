import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";

type BadgeVariant = "neutral" | "active" | "highlight";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const sizeConfig: Record<BadgeSize, { padding: string; fontSize: string }> = {
  sm: { padding: "0.13rem 0.6rem", fontSize: theme.fontSize.xs },
  md: { padding: "0.4rem 0.75rem", fontSize: theme.fontSize.sm },
};

const StyledBadge = styled.span<{ $variant: BadgeVariant; $size: BadgeSize }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: ${({ $size }) => sizeConfig[$size].padding};
  font-size: ${({ $size }) => sizeConfig[$size].fontSize};
  font-weight: ${theme.fontWeight.medium};
  border-radius: ${theme.radius.default};
  background: ${({ $variant }) => theme.badge[$variant].background};
  color: ${({ $variant }) => theme.badge[$variant].color};

  i {
    font-size: inherit;
  }
`;

const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  children,
  className,
}) => (
  <StyledBadge $variant={variant} $size={size} className={className}>
    {children}
  </StyledBadge>
);

export default Badge;
