import React from "react";
import styled from "styled-components";
import { theme } from "@theme";

type IconBadgeVariant = "light" | "dark";

interface IconBadgeProps {
  icon: string;
  size?: number;
  variant?: IconBadgeVariant;
  className?: string;
}

const variantStyles = {
  light: {
    background: theme.colors.primaryBg,
    color: theme.colors.primary,
    borderRadius: theme.radius.default,
  },
  dark: {
    background: theme.colors.primary,
    color: theme.colors.background,
    borderRadius: theme.radius.round,
  },
};

const Wrapper = styled.div<{ $size: number; $variant: IconBadgeVariant }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $variant }) => variantStyles[$variant].borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $variant }) => variantStyles[$variant].background};
  color: ${({ $variant }) => variantStyles[$variant].color};

  i {
    font-size: 1.25rem;
  }
`;

const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  size = 48,
  variant = "light",
  className,
}) => (
  <Wrapper $size={size} $variant={variant} className={className}>
    <i className={icon} />
  </Wrapper>
);

export default IconBadge;
