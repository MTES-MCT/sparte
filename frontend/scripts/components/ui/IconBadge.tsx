import React from "react";
import styled from "styled-components";
import { theme } from "@theme";

type IconBadgeVariant = "light" | "dark";

interface IconBadgeProps {
  icon: string;
  $size?: number;
  $variant?: IconBadgeVariant;
}

const variantStyles = {
  light: {
    background: theme.colors.primaryLight,
    color: theme.colors.primary,
    borderRadius: theme.radius.card,
  },
  dark: {
    background: theme.colors.primary,
    color: theme.colors.background,
    borderRadius: "50%",
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

const IconBadge: React.FC<IconBadgeProps> = ({ icon, $size = 48, $variant = "light" }) => (
  <Wrapper $size={$size} $variant={$variant}>
    <i className={icon} />
  </Wrapper>
);

export default IconBadge;
