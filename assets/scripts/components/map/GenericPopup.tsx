import React from "react";
import styled from "styled-components";

const PopupTitle = styled.div`
    font-size: 0.8em;
    font-weight: 600;
    color: #1e1e1e;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
`;

const PopupContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.1em;
`;

const PopupRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1em;
`;

const PopupLabel = styled.span`
    font-weight: 500;
    color: #666;
    font-size: 0.8em;
`;

const PopupValue = styled.span`
    font-weight: 400;
    text-align: right;
    word-wrap: break-word;
    font-size: 0.8em;
    color: #1e1e1e;
`;

interface GenericPopupProps {
    title?: string;
    data: Array<{
        label: string;
        value: string | number | React.ReactNode;
    }>;
}

export const GenericPopup: React.FC<GenericPopupProps> = ({ 
    title = "Informations", 
    data 
}) => {
    return (
        <div>
            <PopupTitle>{title}</PopupTitle>
            <PopupContent>
                {data.map((item, index) => (
                    <PopupRow key={`${item.label}-${index}`}>
                        <PopupLabel>{item.label}</PopupLabel>
                        <PopupValue>{item.value}</PopupValue>
                    </PopupRow>
                ))}
            </PopupContent>
        </div>
    );
}; 