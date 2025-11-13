import React from "react";
import styled from "styled-components";

const StyledInfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
`;

interface InfoRowProps {
    children: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ children }) => (
    <StyledInfoRow>{children}</StyledInfoRow>
);

