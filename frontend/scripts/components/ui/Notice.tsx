import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";

type NoticeType = "default" | "success" | "warning" | "error";

interface NoticeProps {
    type: NoticeType;
    title: string;
    message: string | ReactNode;
    icon?: string;
    className?: string;
}

const THEME_CONFIG: Record<NoticeType, { color: string; bgColor: string; defaultIcon: string }> = {
    default: {
        color: theme.colors.primary,
        bgColor: theme.colors.primaryBg,
        defaultIcon: "bi bi-info-circle",
    },
    success: {
        color: theme.colors.success,
        bgColor: theme.colors.successBg,
        defaultIcon: "bi bi-check-circle",
    },
    warning: {
        color: theme.colors.warning,
        bgColor: theme.colors.warningBg,
        defaultIcon: "bi bi-exclamation-triangle",
    },
    error: {
        color: theme.colors.error,
        bgColor: theme.colors.errorBg,
        defaultIcon: "bi bi-x-circle",
    },
};

const Container = styled(BaseCard)<{ $type: NoticeType }>`
    padding: ${theme.spacing.lg};
    background: linear-gradient(
        135deg,
        ${({ $type }) => THEME_CONFIG[$type].bgColor} 0%,
        white 100%
    );
`;

const Title = styled.h4<{ $type: NoticeType }>`
    color: ${({ $type }) => THEME_CONFIG[$type].color};
    margin: 0 0 ${theme.spacing.xs} 0;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    i {
        font-size: 1.25rem;
    }
`;

const Message = styled.p`
    font-size: ${theme.fontSize.sm};
    margin: 0;

    p {
        font-size: ${theme.fontSize.sm};
        margin-bottom: ${theme.spacing.sm};

        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const Notice: React.FC<NoticeProps> = ({ type, title, message, icon, className }) => {
    const iconClass = icon ?? THEME_CONFIG[type].defaultIcon;

    return (
        <Container $type={type} className={className}>
            <Title $type={type}>
                <i className={iconClass} />
                {title}
            </Title>
            <Message>{message}</Message>
        </Container>
    );
};

export default Notice;

