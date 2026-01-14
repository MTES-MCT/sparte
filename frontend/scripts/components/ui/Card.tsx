import React from 'react';
import styled from "styled-components";

interface CardProps {
    icon?: string;
    badgeClass?: string;
    badgeLabel?: string;
    value?: React.ReactNode;
    label?: React.ReactNode;
    isHighlighted?: boolean;
    highlightBadge?: string;
    highlightBadgeIcon?: string;
    className?: string;
    children?: React.ReactNode;
    empty?: boolean;
}

const CardContainer = styled.div<{ $isHighlighted?: boolean }>`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    position: relative;
    ${({ $isHighlighted }) => $isHighlighted && `
        background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
        border-color: var(--artwork-major-blue-france);
        border-width: 3px;
        border-style: solid;
    `}
`;

const HighlightBadge = styled.div`
    position: absolute;
    top: -10px;
    right: 10px;
    background: var(--artwork-major-blue-france);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CardHeader = styled.div<{ $hasNoIcon?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    ${({ $hasNoIcon }) => $hasNoIcon && `
        padding-top: 1rem;
    `}
`;

const CardIcon = styled.i<{ $isHighlighted?: boolean }>`
    font-size: 2.5rem;
    ${({ $isHighlighted }) => $isHighlighted
        ? `color: var(--artwork-major-blue-france);`
        : `color: var(--text-default-grey);`
    }
`;

const CardBadge = styled.span`
    font-size: 1rem;
    text-transform: lowercase;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const CardValue = styled.div<{ $isHighlighted?: boolean; $isLongValue?: boolean }>`
	font-size: 2.5rem;
	font-weight: bold;
	line-height: 2.5rem;
	height: 3rem;
	display: flex;
	align-items: center;
	${({ $isHighlighted }) => $isHighlighted
	    ? `color: var(--artwork-major-blue-france);`
	    : `color: var(--text-default-grey);`
	}
`;

const CardLabel = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0;
`;

const CardFooter = styled.div<{ $empty?: boolean }>`
    margin-top: 0.5rem;
    ${({ $empty }) => $empty && `
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `}
`;

const Card: React.FC<CardProps> = ({
    icon = "",
    badgeClass = "",
    badgeLabel = "",
    value = "",
    label = "",
    isHighlighted = false,
    highlightBadge,
    highlightBadgeIcon = "bi bi-lightning-charge",
    className = "",
    children,
    empty = false
}) => {
    return (
        <CardContainer $isHighlighted={isHighlighted} className={className}>
            {highlightBadge && (
                <HighlightBadge>
                    <i className={highlightBadgeIcon}></i> {highlightBadge}
                </HighlightBadge>
            )}
            {badgeClass && badgeLabel && (
                <CardHeader $hasNoIcon={!icon}>
                    {icon && <CardIcon className={icon} $isHighlighted={isHighlighted} />}
                    <CardBadge className={`fr-badge fr-badge--no-icon ${badgeClass}`}>
                        {badgeLabel}
                    </CardBadge>
                </CardHeader>
            )}
            {!empty && (
                <CardContent>
                    <CardValue $isHighlighted={isHighlighted}>{value}</CardValue>
                    <CardLabel>{label}</CardLabel>
                </CardContent>
            )}
            {children && (
                <CardFooter $empty={empty}>
                    {children}
                </CardFooter>
            )}
        </CardContainer>
    );
};

export default Card; 