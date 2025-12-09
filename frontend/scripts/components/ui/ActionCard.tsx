import React from 'react';
import styled from 'styled-components';

interface ActionCardProps {
    icon?: string;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}

const CardButton = styled.button`
    border: 1px solid var(--border-default-grey);
    border-radius: 0.25rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: var(--lifted);
    width: 100%;

    &:hover:not(:disabled) {
        background: var(--artwork-decorative-blue-france)
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        
        &:hover {
            background: var(--background-default-grey);
        }
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const CardIcon = styled.span`
    font-size: 1.5rem;
    color: var(--text-default-grey);
`;

const CardTitle = styled.h4`
    margin-bottom: 0;
`;

const CardDescription = styled.p`
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--text-mention-grey);
`;

const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
}) => {
    return (
        <CardButton onClick={onClick} disabled={disabled}>
            <CardHeader>
                {icon && <CardIcon className={icon} aria-hidden="true" />}
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardDescription>{description}</CardDescription>
        </CardButton>
    );
};

export default ActionCard;

