import React from "react";
import styled from "styled-components";

const StyledInfoLabel = styled.span`
    font-weight: 500;
    color: #666;
    font-size: 0.65rem;
    min-width: 80px;
`;

interface InfoLabelProps {
    children: React.ReactNode;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({ children }) => (
    <StyledInfoLabel>{children}</StyledInfoLabel>
);

