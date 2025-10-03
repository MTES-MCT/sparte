import React from "react";
import styled from "styled-components";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";

const ColorIndicator = styled.span<{ $color?: string }>`
    display: inline-block;
    width: 30px;
    height: 14px;
    background-color: ${props => props.$color || 'transparent'};
`;

const OptionLabel = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const OptionText = styled.span`
    margin-right: 0.5rem;
`;

export interface OcsgeSelectOption<T = string> {
    value: T;
    label: string;
}

export interface OcsgeMultiSelectControlProps<T = string> {
    label?: string;
    value: T[];
    options: Array<OcsgeSelectOption<T>>;
    onChange?: (value: T[]) => void;
    disabled?: boolean;
    nomenclature: 'couverture' | 'usage';
}

export const OcsgeMultiSelectControl = <T extends string | number = string>({ 
    label, 
    value, 
    options, 
    onChange, 
    disabled = false, 
    nomenclature 
}: OcsgeMultiSelectControlProps<T>) => {
    const handleToggle = (optionValue: T, checked: boolean) => {
        if (disabled || !onChange) return;
        if (checked) {
            onChange([...value, optionValue]);
        } else {
            onChange(value.filter(v => v !== optionValue));
        }
    };

    const getColor = (value: T): string | undefined => {
        const map = nomenclature === 'couverture' ? COUVERTURE_COLORS : USAGE_COLORS;
        const rgb = map[value as keyof typeof map] as [number, number, number] | undefined;
        return rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : undefined;
    };

    return (
        <Checkbox
            legend={label}
            classes={{ legend: "fr-text--sm fr-mb-0", inputGroup: "fr-mb-0", root: "fr-mb-0" }}
            options={options.map(option => ({
                label: (
                    <OptionLabel>
                        <OptionText>{option.label}</OptionText>
                        <ColorIndicator 
                            aria-hidden
                            $color={getColor(option.value)}
                        />
                    </OptionLabel>
                ),
                nativeInputProps: {
                    name: 'ocsge-multiselect-control',
                    value: String(option.value),
                    checked: value.includes(option.value),
                    disabled,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleToggle(option.value, e.target.checked),
                }
            }))}
            small
        />
    );
};
