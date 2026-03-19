import React, { forwardRef } from "react";
import { Link, LinkProps } from "react-router-dom";
import styled, { css } from "styled-components";
import { theme } from "@theme";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "md" | "sm";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "left" | "right";
  noBackground?: boolean;
  noPadding?: boolean;
  children?: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<LinkProps, keyof BaseProps> & {
    to: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeMap = {
  md: css`
    padding: 0.5rem 1rem;
    font-size: ${theme.fontSize.sm};
    gap: 0.5rem;
  `,
  sm: css`
    padding: 0.375rem 0.75rem;
    font-size: ${theme.fontSize.xs};
    gap: 0.375rem;
  `,
};

const variantMap = {
  primary: css`
    background: ${theme.button.primary.background};
    color: ${theme.button.primary.color};

    &:hover:not(:disabled) {
      background: ${theme.button.primary.backgroundHover};
      color: ${theme.button.primary.color};
    }
  `,
  secondary: css`
    border: 1px solid ${theme.button.secondary.border};

    &:hover:not(:disabled) {
      background: ${theme.button.secondary.backgroundHover};
      border: 1px solid ${theme.button.secondary.borderHover};
    }
  `,
  tertiary: css`
    background: ${theme.button.tertiary.background};
    color: ${theme.button.tertiary.color};

    &:hover:not(:disabled) {
      background: ${theme.button.tertiary.backgroundHover};
    }
  `,
};

const baseStyles = css<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $noBackground?: boolean;
  $noPadding?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: ${theme.fontWeight.medium};
  text-decoration: none;
  border: none;
  border-radius: ${theme.radius.default};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  ${({ $size, $noPadding }) =>
    $noPadding
      ? css`
          padding: 0;
          gap: 0.25rem;
        `
      : sizeMap[$size]}

  ${({ $variant }) => variantMap[$variant]}

  ${({ $noBackground }) =>
    $noBackground &&
    css`
      background: transparent;

      &:hover:not(:disabled) {
        background: transparent;
        text-decoration: underline;
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 1.1em;
  }
`;

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $noBackground?: boolean;
  $noPadding?: boolean;
}>`
  ${baseStyles}
`;

const StyledLink = styled(Link)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $noBackground?: boolean;
  $noPadding?: boolean;
}>`
  ${baseStyles}
`;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    noBackground = false,
    noPadding = false,
    children,
    className,
  } = props;

  const content = (
    <>
      {icon && iconPosition === "left" && <i className={icon} aria-hidden="true" />}
      {children}
      {icon && iconPosition === "right" && <i className={icon} aria-hidden="true" />}
    </>
  );

  const styleProps = {
    $variant: variant,
    $size: size,
    $noBackground: noBackground,
    $noPadding: noPadding,
  };

  if ("to" in props && props.to) {
    const { to, variant: _, size: __, icon: ___, iconPosition: ____, noBackground: _____, noPadding: ______, ...linkProps } =
      props as ButtonAsLink;
    return (
      <StyledLink to={to} ref={ref as React.Ref<HTMLAnchorElement>} className={className} {...styleProps} {...linkProps}>
        {content}
      </StyledLink>
    );
  }

  const { variant: _, size: __, icon: ___, iconPosition: ____, noBackground: _____, noPadding: ______, ...buttonProps } =
    props as ButtonAsButton;
  return (
    <StyledButton ref={ref as React.Ref<HTMLButtonElement>} className={className} {...styleProps} {...buttonProps}>
      {content}
    </StyledButton>
  );
});

Button.displayName = "Button";

export default Button;
