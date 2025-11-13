import React from "react";
import styled from "styled-components";

const StyledInfoValue = styled.span`
    font-weight: 400;
    text-align: right;
    word-wrap: break-word;
    font-size: 0.65rem;
    color: #1e1e1e;
    flex: 1;
`;

interface InfoValueProps {
    children: React.ReactNode;
}

export const InfoValue: React.FC<InfoValueProps> = ({ children }) => (
    <StyledInfoValue>{children}</StyledInfoValue>
);

