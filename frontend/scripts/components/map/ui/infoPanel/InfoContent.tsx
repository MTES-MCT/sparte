import React from "react";
import styled from "styled-components";

const StyledInfoContent = styled.div`
    display: flex;
    flex-direction: column;
`;

interface InfoContentProps {
    children: React.ReactNode;
}

export const InfoContent: React.FC<InfoContentProps> = ({ children }) => (
    <StyledInfoContent>{children}</StyledInfoContent>
);

