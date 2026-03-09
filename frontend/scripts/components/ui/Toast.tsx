import React from "react";
import { toast, ToastOptions, ToastContainer as ReactToastifyContainer } from "react-toastify";
import styled from "styled-components";
import Button from "@components/ui/Button";
import { theme } from "@theme";

type ToastType = "info" | "warning" | "error" | "success";

interface ToastAction {
    label: string;
    onClick: () => void;
}

const ICON_MAP: Record<ToastType, string> = {
    info: "fr-icon-info-fill",
    warning: "fr-icon-warning-fill",
    error: "fr-icon-error-fill",
    success: "fr-icon-success-fill",
};

const COLOR_MAP: Record<ToastType, { background: string; border: string; icon: string }> = {
    info: {
        background: "var(--background-contrast-info)",
        border: "var(--border-plain-info)",
        icon: "var(--text-default-info)",
    },
    warning: {
        background: "var(--background-contrast-warning)",
        border: "var(--border-plain-warning)",
        icon: "var(--text-default-warning)",
    },
    error: {
        background: "var(--background-contrast-error)",
        border: "var(--border-plain-error)",
        icon: "var(--text-default-error)",
    },
    success: {
        background: "var(--background-contrast-success)",
        border: "var(--border-plain-success)",
        icon: "var(--text-default-success)",
    },
};

const Container = styled.div<{ $type: ToastType }>`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: ${({ $type }) => COLOR_MAP[$type].background};
    border-left: 4px solid ${({ $type }) => COLOR_MAP[$type].border};
    border-radius: 4px;
    min-width: 300px;
    max-width: 400px;
`;

const Icon = styled.span<{ $type: ToastType }>`
    color: ${({ $type }) => COLOR_MAP[$type].icon};
    flex-shrink: 0;
    
    &::before {
        --icon-size: 1.25rem;
    }
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: ${theme.fontSize.md};
    color: var(--text-title-grey);
`;

const Description = styled.span`
    font-size: ${theme.fontSize.sm};
    color: var(--text-mention-grey);
`;

const ActionWrapper = styled.div`
    margin-top: 0.5rem;
    font-size: ${theme.fontSize.md};
`;

const ToastContent: React.FC<{
    type: ToastType;
    title: string;
    description?: string;
    action?: ToastAction;
}> = ({ type, title, description, action }) => (
    <Container $type={type}>
        <Icon $type={type} className={ICON_MAP[type]} aria-hidden="true" />
        <Content>
            <Title>{title}</Title>
            {description && <Description>{description}</Description>}
            {action && (
                <ActionWrapper>
                    <Button variant="tertiary" noBackground noPadding onClick={action.onClick}>
                        {action.label}
                    </Button>
                </ActionWrapper>
            )}
        </Content>
    </Container>
);

const StyledContainer = styled.div`
    .Toastify__toast-container {
        padding: 0;
    }

    .Toastify__toast {
        padding: 0;
        margin-bottom: 0.5rem;
        background: transparent;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        min-height: auto;
    }

    .Toastify__toast-body {
        padding: 0;
        margin: 0;
    }
`;

export const ToastContainer: React.FC = () => (
    <StyledContainer>
        <ReactToastifyContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
            theme="light"
        />
    </StyledContainer>
);

const DEFAULT_OPTIONS: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    closeButton: false,
};

function showToast(
    type: ToastType,
    title: string,
    description?: string,
    action?: ToastAction,
    options?: ToastOptions
) {
    toast(
        <ToastContent type={type} title={title} description={description} action={action} />,
        { ...DEFAULT_OPTIONS, ...options }
    );
}

export const showInfoToast = (title: string, description?: string) => 
    showToast("info", title, description);

export const showSuccessToast = (title: string, description?: string) => 
    showToast("success", title, description);

export const showErrorToast = (title: string, description?: string) => 
    showToast("error", title, description);

export const showAuthRequiredToast = (
    message = "Connectez-vous pour effectuer cette action",
    redirectUrl?: string
) => {
    const loginUrl = redirectUrl 
        ? `/users/signin/?next=${encodeURIComponent(redirectUrl)}`
        : `/users/signin/?next=${encodeURIComponent(window.location.pathname)}`;

    showToast(
        "warning",
        "Connexion requise",
        message,
        {
            label: "Se connecter",
            onClick: () => { window.location.href = loginUrl; },
        },
        { autoClose: 8000 }
    );
};
