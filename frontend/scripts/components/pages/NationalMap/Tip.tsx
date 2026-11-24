import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import IconBadge from '@components/ui/IconBadge';

// Encart d'aide fermable, dans le style des encarts « Comprendre » des diagnostics (GuideContent).
// La fermeture est mémorisée dans le navigateur (pas en base) ; le paramètre d'URL ?showinfo
// réaffiche les encarts et oublie leur fermeture.
const SHOW_INFO_PARAM = 'showinfo';
const TIP_STORAGE_PREFIX = 'national-map:tip-closed:';

const Card = styled(BaseCard)`
    position: relative;
    padding: ${theme.spacing.md};
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
    padding-right: 1.75rem;
`;

const Title = styled.span`
    font-size: ${theme.fontSize.md};
    font-weight: ${theme.fontWeight.bold};
    letter-spacing: -0.01em;
    color: ${theme.colors.text};
`;

const Content = styled.div`
    font-size: ${theme.fontSize.sm};
    line-height: 1.6;
    color: ${theme.colors.textLight};

    p {
        margin: 0 0 ${theme.spacing.xs};
        font-size: inherit;

        &:last-child {
            margin-bottom: 0;
        }
    }

    i {
        margin: 0 0.15rem;
    }
`;

const Close = styled.button`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: ${theme.radius.default};
    color: ${theme.colors.textMuted};
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
        color: ${theme.colors.text};
    }
`;

const isShowInfoRequested = (): boolean => new URLSearchParams(window.location.search).has(SHOW_INFO_PARAM);

const isTipClosed = (id: string): boolean => {
    try {
        return window.localStorage.getItem(TIP_STORAGE_PREFIX + id) === '1';
    } catch {
        return false;
    }
};

const rememberTipClosed = (id: string): void => {
    try {
        window.localStorage.setItem(TIP_STORAGE_PREFIX + id, '1');
    } catch {
        // Stockage indisponible (navigation privée, quota…) : l'encart réapparaîtra à la prochaine visite
    }
};

const forgetTipClosed = (id: string): void => {
    try {
        window.localStorage.removeItem(TIP_STORAGE_PREFIX + id);
    } catch {
        // Stockage indisponible : rien à oublier
    }
};

interface TipProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

const Tip: React.FC<TipProps> = ({ id, title, children }) => {
    const [isOpen, setIsOpen] = useState(() => {
        if (isShowInfoRequested()) {
            forgetTipClosed(id);
            return true;
        }
        return !isTipClosed(id);
    });
    if (!isOpen) return null;

    const close = () => {
        setIsOpen(false);
        rememberTipClosed(id);
    };

    return (
        <Card>
            <Close type="button" onClick={close} aria-label={`Fermer l'aide « ${title} »`}>
                <i className="bi bi-x-lg" aria-hidden="true" />
            </Close>
            <Header>
                <IconBadge icon="bi bi-lightbulb" size={32} />
                <Title>{title}</Title>
            </Header>
            <Content>{children}</Content>
        </Card>
    );
};

export default Tip;
