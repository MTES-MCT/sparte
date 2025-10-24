import React from 'react';
import styled from "styled-components";

interface CardProps {
    icon: string;
    badgeClass: string;
    badgeLabel: string;
    value: React.ReactNode;
    label: React.ReactNode;
    isHighlighted?: boolean;
    highlightBadge?: string;
    className?: string;
    children?: React.ReactNode;
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
    ${({ $isHighlighted }) => $isHighlighted && `
        position: relative;
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

const CardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

const CardValue = styled.div<{ $isHighlighted?: boolean }>`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
	height: 3rem;
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

const CardFooter = styled.div`
    margin-top: 0.5rem;
`;

const Card: React.FC<CardProps> = ({
    icon,
    badgeClass,
    badgeLabel,
    value,
    label,
    isHighlighted = false,
    highlightBadge,
    className = "",
    children
}) => {
    return (
        <CardContainer $isHighlighted={isHighlighted} className={className}>
            {isHighlighted && highlightBadge && (
                <HighlightBadge>
                    <i className="bi bi-lightning-charge"></i> {highlightBadge}
                </HighlightBadge>
            )}
            <CardHeader>
                <CardIcon className={icon} $isHighlighted={isHighlighted} />
                <CardBadge className={`fr-badge fr-badge--no-icon ${badgeClass}`}>
                    {badgeLabel}
                </CardBadge>
            </CardHeader>
            <CardContent>
                <CardValue $isHighlighted={isHighlighted}>{value}</CardValue>
                <CardLabel>{label}</CardLabel>
            </CardContent>
            {children && (
                <CardFooter>
                    {children}
                </CardFooter>
            )}
        </CardContainer>
    );
};

export default Card; 