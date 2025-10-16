import React from "react";
import styled from "styled-components";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const ColorIndicator = styled.div<{ $backgroundColor: string }>`
    width: 16px;
    height: 16px;
    background-color: ${props => props.$backgroundColor};
`;

interface OcsgeNomenclatureFilterControlProps {
    value: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
    availableCodes: string[];
    currentNomenclature: 'couverture' | 'usage';
    getColorForCode: (code: string, nomenclature: 'couverture' | 'usage') => [number, number, number];
}

export const OcsgeNomenclatureFilterControl: React.FC<OcsgeNomenclatureFilterControlProps> = (props) => {
    const { value, onChange, disabled, availableCodes, currentNomenclature, getColorForCode } = props;
    const selectedCodes = value;

    return (
        <Checkbox
            legend="Filtrer par codes"
            classes={{ legend: "fr-text--sm fr-mb-0"}}
            options={availableCodes.map((code: string) => {
                const isChecked = selectedCodes.includes(code);
                const color = getColorForCode(code, currentNomenclature);

                return {
                    label: (
                        <CheckboxContainer>
                            <span>{code}</span>
                            <ColorIndicator $backgroundColor={`rgb(${color.join(', ')})`} />
                        </CheckboxContainer>
                    ),
                    nativeInputProps: {
                        name: `filter-${code}`,
                        value: code,
                        checked: isChecked,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const newSelectedCodes = e.target.checked
                                ? [...selectedCodes, code]
                                : selectedCodes.filter(c => c !== code);
                            onChange(newSelectedCodes);
                        }
                    }
                };
            })}
            disabled={disabled}
            small
        />
    );
};
