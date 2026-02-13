import React, { forwardRef } from "react";
import styled, { css } from "styled-components";
import { theme } from "@theme";

type ButtonVariant = "primary" | "secondary" | "link" | "outline";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  icon?: string;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: "button";
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: "a";
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  border-radius: ${theme.radius};
  cursor: pointer;
  transition: background 0.15s ease, gap 0.2s ease;
  text-decoration: none;

  i {
    font-size: ${theme.fontSize.xs};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const variantStyles = {
  primary: css`
    padding: 0.5rem 0.9rem;
    background: ${theme.button.primary.background};
    color: ${theme.button.primary.color};
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.button.primary.backgroundHover};
    }
  `,
  secondary: css`
    padding: 0.4rem 0.7rem;
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
      gap: 0.55rem;
      text-decoration: underline;
    }
  `,
  outline: css`
    padding: 0.4rem 0.7rem;
    background: ${theme.button.outline.background};
    color: ${theme.button.outline.color};
    border: 1px solid ${theme.button.outline.border};

    &:hover:not(:disabled) {
      background: ${theme.button.outline.backgroundHover};
    }
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  ${baseStyles}
  ${({ $variant }) => variantStyles[$variant]}
`;

const StyledLink = styled.a<{ $variant: ButtonVariant }>`
  ${baseStyles}
  ${({ $variant }) => variantStyles[$variant]}
`;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", icon, children, ...rest } = props;

    const content = (
      <>
        {icon && <i className={icon} aria-hidden="true" />}
        {children}
      </>
    );

    if (props.as === "a") {
      const { as: _, ...linkProps } = rest as ButtonAsLink;
      return (
        <StyledLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          $variant={variant}
          {...linkProps}
        >
          {content}
        </StyledLink>
      );
    }

    const { as: _, ...buttonProps } = rest as ButtonAsButton;
    return (
      <StyledButton
        ref={ref as React.Ref<HTMLButtonElement>}
        $variant={variant}
        {...buttonProps}
      >
        {content}
      </StyledButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
