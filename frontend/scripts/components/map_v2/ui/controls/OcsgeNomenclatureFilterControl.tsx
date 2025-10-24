import React from "react";
import styled from "styled-components";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { getOcsgeLabel } from "../../utils/ocsge";

const CheckboxContainer = styled.div`
    display: flex;
    align-items: top;
    justify-content: space-between;
    width: 100%;
`;

const CodeName = styled.div`
    font-size: 0.8rem;
    font-weight: bold;
`;

const CodeLabel = styled.div`
    font-size: 0.8rem;
    color: #666;
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
    getColorForCode: (code: string, nomenclature: 'couverture' | 'usage') => string;
}

export const OcsgeNomenclatureFilterControl: React.FC<OcsgeNomenclatureFilterControlProps> = (props) => {
    const { value, onChange, disabled, availableCodes, currentNomenclature, getColorForCode } = props;
    const selectedCodes = value;

    return (
        <Checkbox
            legend="Filtrer par codes"
            classes={{ legend: "fr-text--sm fr-mb-0" }}
            options={availableCodes.map((code: string) => {
                const isChecked = selectedCodes.includes(code);
                const color = getColorForCode(code, currentNomenclature);

                return {
                    label: (
                        <CheckboxContainer>
                            <div>
                                <CodeName>{code}</CodeName>
                                <CodeLabel>
                                    {getOcsgeLabel(code, currentNomenclature)}
                                </CodeLabel>
                            </div>
                            <ColorIndicator $backgroundColor={color} />
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
