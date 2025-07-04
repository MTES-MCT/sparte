import React from 'react';
import styled from "styled-components";

const CardContainer = styled.div<{ $isHighlighted?: boolean }>`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    ${({ $isHighlighted }) => $isHighlighted && `
        border: 3px solid var(--artwork-major-blue-france);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        position: relative;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
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
    ${({ $isHighlighted }) => $isHighlighted && `
        color: var(--artwork-major-blue-france);
    `}
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
	${({ $isHighlighted }) => $isHighlighted && `
	    color: var(--artwork-major-blue-france);
	`}
`;

const CardLabel = styled.p`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0;
`;

interface CardProps {
    icon: string;
    badge: string;
    value: string | number;
    label: string;
    isHighlighted?: boolean;
    highlightBadge?: string;
    className?: string;
}

const Card: React.FC<CardProps> = ({
    icon,
    badge,
    value,
    label,
    isHighlighted = false,
    highlightBadge,
    className = ""
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
                <CardBadge className={`fr-badge fr-badge--no-icon ${isHighlighted ? 'fr-badge--error' : 'fr-badge--info'}`}>
                    {badge}
                </CardBadge>
            </CardHeader>
            <CardContent>
                <CardValue $isHighlighted={isHighlighted}>{value}</CardValue>
                <CardLabel>{label}</CardLabel>
            </CardContent>
        </CardContainer>
    );
};

export default Card; 