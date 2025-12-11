import React from "react";
import styled from "styled-components";

interface ParagraphProps {
    children: React.ReactNode;
    className?: string;
}

const StyledParagraph = styled.p`
    font-size: 0.85rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 1rem;
    text-align: justify;
`;

const Paragraph: React.FC<ParagraphProps> = ({ children, className = "" }) => {
    return <StyledParagraph className={className}>{children}</StyledParagraph>;
};

export default Paragraph;

