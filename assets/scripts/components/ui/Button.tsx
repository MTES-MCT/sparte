import React from 'react';
import styled, { css } from 'styled-components';

const ButtonStyle = css`
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 6px;
    color: #4318FF;
    font-size: 0.8em;
    transition: color 0.3s ease, background-color 0.3s ease;
    width: auto;
    background: #cacafb;

    &:hover {
        background-color: #4318FF !important;
        color: #FFFFFF !important;
    }
`;

const LinkElement = styled.a`
    ${ButtonStyle}
`;

const ButtonElement = styled.button`
    ${ButtonStyle}
`;

const ButtonIcon = styled.i`
    font-size: 1.4em;
    margin-right: 0.5rem;
`;

interface ButtonProps {
    type: 'button' | 'link' | 'htmx';
    icon?: string;
    label: string;
    url?: string;
    htmxAttrs?: { [key: string]: string };
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ type, icon, label, url, htmxAttrs, onClick }) => {
    const renderButton = {
        link: (
            <LinkElement href={url}>
                {icon && <ButtonIcon aria-hidden="true" className={icon}></ButtonIcon>}
                {label}
            </LinkElement>
        ),
        htmx: (
            <ButtonElement {...htmxAttrs} onClick={onClick}>
                {icon && <ButtonIcon aria-hidden="true" className={icon}></ButtonIcon>}
                {label}
            </ButtonElement>
        ),
        button: (
            <ButtonElement onClick={onClick}>
                {icon && <ButtonIcon aria-hidden="true" className={icon}></ButtonIcon>}
                {label}
            </ButtonElement>
        ),
    };

    return renderButton[type] || null;
};

export default Button;
