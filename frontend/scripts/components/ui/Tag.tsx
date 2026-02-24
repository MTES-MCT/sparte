import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import { theme } from "@theme";

type TagVariant = "neutral" | "active" | "highlight";
type TagSize = "sm" | "md";

interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const sizeConfig: Record<TagSize, { padding: string; fontSize: string }> = {
  sm: { padding: "0.25rem 0.5rem", fontSize: theme.fontSize.xs },
  md: { padding: "0.35rem 0.65rem", fontSize: theme.fontSize.sm },
};

const tagStyles = css<{ $variant: TagVariant; $size: TagSize; $dismissible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: ${({ $size }) => sizeConfig[$size].padding};
  font-size: ${({ $size }) => sizeConfig[$size].fontSize};
  font-weight: ${theme.fontWeight.medium};
  border-radius: ${theme.radius.tag};
  background: ${({ $variant }) => theme.badge[$variant].background};
  color: ${({ $variant }) => theme.badge[$variant].color};
  border: none;
  cursor: ${({ $dismissible }) => ($dismissible ? "pointer" : "default")};
  transition: opacity 0.15s ease;

  ${({ $dismissible }) =>
    $dismissible &&
    css`
      &:hover {
        opacity: 0.8;
      }
    `}

  i {
    font-size: 0.75em;
    opacity: 0.7;
  }
`;

const StyledTagSpan = styled.span<{ $variant: TagVariant; $size: TagSize; $dismissible: boolean }>`
  ${tagStyles}
`;

const StyledTagButton = styled.button<{ $variant: TagVariant; $size: TagSize; $dismissible: boolean }>`
  ${tagStyles}
`;

const Tag: React.FC<TagProps> = ({
  variant = "active",
  size = "md",
  children,
  onDismiss,
  className,
}) => {
  if (onDismiss) {
    return (
      <StyledTagButton
        type="button"
        $variant={variant}
        $size={size}
        $dismissible={true}
        className={className}
        onClick={onDismiss}
        aria-label={`Supprimer ${typeof children === "string" ? children : ""}`}
      >
        {children}
        <i className="bi bi-x-lg" />
      </StyledTagButton>
    );
  }

  return (
    <StyledTagSpan $variant={variant} $size={size} $dismissible={false} className={className}>
      {children}
    </StyledTagSpan>
  );
};

export default Tag;
