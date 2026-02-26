import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import { theme } from "@theme";

type TagVariant = "neutral" | "primary" | "success" | "error";
type TagSize = "sm" | "md";

interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  icon?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const sizeConfig: Record<TagSize, { padding: string; fontSize: string }> = {
  sm: { padding: "0.25rem 0.5rem", fontSize: theme.fontSize.xs },
  md: { padding: "0.35rem 0.65rem", fontSize: theme.fontSize.sm },
};

const variantConfig: Record<TagVariant, { background: string; backgroundHover: string; color: string }> = {
  neutral: { background: theme.colors.backgroundMuted, backgroundHover: theme.colors.backgroundMutedHover, color: theme.colors.text },
  primary: { background: theme.colors.primary, backgroundHover: theme.colors.primaryHover, color: "white" },
  success: { background: theme.colors.success, backgroundHover: theme.colors.successHover, color: "white" },
  error: { background: theme.colors.error, backgroundHover: theme.colors.errorHover, color: "white" },
};

const tagStyles = css<{ $variant: TagVariant; $size: TagSize; $clickable: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: ${({ $size }) => sizeConfig[$size].padding};
  font-size: ${({ $size }) => sizeConfig[$size].fontSize};
  font-weight: ${theme.fontWeight.semibold};
  border-radius: ${theme.radius.tag};
  background: ${({ $variant }) => variantConfig[$variant].background};
  color: ${({ $variant }) => variantConfig[$variant].color};
  border: none;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: background 0.15s ease;

  ${({ $clickable, $variant }) =>
    $clickable &&
    css`
      &:hover {
        background: ${variantConfig[$variant].backgroundHover} !important;
      }
    `}

  i {
    font-size: 0.85em;
  }
`;

const StyledTagSpan = styled.span<{ $variant: TagVariant; $size: TagSize; $clickable: boolean }>`
  ${tagStyles}
`;

const StyledTagButton = styled.button<{ $variant: TagVariant; $size: TagSize; $clickable: boolean }>`
  ${tagStyles}
`;

const Tag: React.FC<TagProps> = ({
  variant = "neutral",
  size = "md",
  icon,
  children,
  onDismiss,
  className,
}) => {
  const content = (
    <>
      {icon && <i className={icon} />}
      {children}
      {onDismiss && <i className="bi bi-x-lg" />}
    </>
  );

  if (onDismiss) {
    return (
      <StyledTagButton
        type="button"
        $variant={variant}
        $size={size}
        $clickable={true}
        className={className}
        onClick={onDismiss}
        aria-label={`Supprimer ${typeof children === "string" ? children : ""}`}
      >
        {content}
      </StyledTagButton>
    );
  }

  return (
    <StyledTagSpan $variant={variant} $size={size} $clickable={false} className={className}>
      {content}
    </StyledTagSpan>
  );
};

export default Tag;
