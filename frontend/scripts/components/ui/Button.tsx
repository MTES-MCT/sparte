import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { theme } from "@theme";

type ButtonVariant = "primary" | "secondary" | "link" | "outline";
type ButtonSize = "default" | "small";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: "button";
    href?: never;
    to?: never;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: "a";
    href: string;
    to?: never;
  };

type ButtonAsRouterLink = ButtonBaseProps & {
  as?: "link";
  to: string;
  href?: never;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsRouterLink;

const baseStyles = css`
  display: inline-flex;
  align-items: center;
  border-radius: ${theme.radius};
  cursor: pointer;
  transition: background 0.15s ease, gap 0.2s ease;
  text-decoration: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sizeStyles = {
  default: css`
    gap: 0.35rem;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.normal};

    i {
      font-size: ${theme.fontSize.xs};
    }
  `,
  small: css`
    gap: 0.25rem;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.medium};

    i {
      font-size: 0.65rem;
    }
  `,
};

const variantStyles = {
  primary: css<{ $size: ButtonSize }>`
    padding: ${({ $size }) => ($size === "small" ? "0.3rem 0.6rem" : "0.5rem 0.9rem")};
    background: ${theme.button.primary.background};
    color: ${theme.button.primary.color};
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.button.primary.backgroundHover};
      color: ${theme.button.primary.color};
    }
  `,
  secondary: css<{ $size: ButtonSize }>`
    padding: ${({ $size }) => ($size === "small" ? "0.25rem 0.5rem" : "0.4rem 0.7rem")};
    background: ${theme.button.secondary.background};
    color: ${theme.button.secondary.color};
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.button.secondary.backgroundHover};
    }
  `,
  link: css`
    padding: 0;
    background: transparent;
    color: ${theme.button.link.color};
    border: none;

    &:hover:not(:disabled) {
      background: transparent;
      gap: 0.55rem;
      text-decoration: underline;
    }
  `,
  outline: css<{ $size: ButtonSize }>`
    padding: ${({ $size }) => ($size === "small" ? "0.25rem 0.5rem" : "0.4rem 0.7rem")};
    background: ${theme.button.outline.background};
    color: ${theme.button.outline.color};
    border: 1px solid ${theme.button.outline.border};

    &:hover:not(:disabled) {
      background: ${theme.button.outline.backgroundHover};
    }
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize }>`
  ${baseStyles}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
`;

const StyledAnchor = styled.a<{ $variant: ButtonVariant; $size: ButtonSize }>`
  ${baseStyles}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
`;

const StyledRouterLink = styled(Link)<{ $variant: ButtonVariant; $size: ButtonSize }>`
  ${baseStyles}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
`;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", size = "default", icon, iconPosition = "left", children, ...rest } = props;

    const content = (
      <>
        {icon && iconPosition === "left" && <i className={icon} aria-hidden="true" />}
        {children}
        {icon && iconPosition === "right" && <i className={icon} aria-hidden="true" />}
      </>
    );

    // React Router Link
    if ("to" in props && props.to) {
      const { as: _, to, ...linkProps } = rest as ButtonAsRouterLink;
      return (
        <StyledRouterLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          $variant={variant}
          $size={size}
          to={to}
          {...linkProps}
        >
          {content}
        </StyledRouterLink>
      );
    }

    // Standard anchor
    if (props.as === "a") {
      const { as: _, ...anchorProps } = rest as ButtonAsAnchor;
      return (
        <StyledAnchor
          ref={ref as React.Ref<HTMLAnchorElement>}
          $variant={variant}
          $size={size}
          {...anchorProps}
        >
          {content}
        </StyledAnchor>
      );
    }

    // Default button
    const { as: _, ...buttonProps } = rest as ButtonAsButton;
    return (
      <StyledButton
        ref={ref as React.Ref<HTMLButtonElement>}
        $variant={variant}
        $size={size}
        {...buttonProps}
      >
        {content}
      </StyledButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
