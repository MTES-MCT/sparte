import React from "react";
import styled from "styled-components";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

export interface SelectOption<T = string> {
    value: T;
    label: string;
}

export interface MultiSelectControlProps<T = string> {
    value: T[];
    options: Array<SelectOption<T>>;
    onChange?: (value: T[]) => void;
    disabled?: boolean;
}

const MultiSelectContainer = styled.div<{ $disabled: boolean }>`
    opacity: ${props => props.$disabled ? 0.5 : 1};
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    background: #fff;
`;

export const MultiSelectControl = <T extends string | number = string>({ value, options, onChange, disabled = false }: MultiSelectControlProps<T>) => {
    const handleToggle = (optionValue: T, checked: boolean) => {
        if (disabled || !onChange) return;
        if (checked) {
            onChange([...value, optionValue]);
        } else {
            onChange(value.filter(v => v !== optionValue));
        }
    };

    return (
        <MultiSelectContainer $disabled={disabled}>
            <Checkbox
                options={options.map(option => ({
                    label: option.label,
                    nativeInputProps: {
                        name: 'multiselect-control',
                        value: String(option.value),
                        checked: value.includes(option.value),
                        disabled,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleToggle(option.value, e.target.checked),
                    }
                }))}
                small
            />
        </MultiSelectContainer>
    );
};


