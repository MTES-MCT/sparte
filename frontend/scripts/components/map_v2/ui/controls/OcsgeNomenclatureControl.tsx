import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import type { ControlUIProps } from "../../types/controls";

export const OcsgeNomenclatureControl: React.FC<ControlUIProps> = (props) => {
    const options = [
        { value: "couverture", label: "Couverture du sol" },
        { value: "usage", label: "Usage du sol" }
    ];

    return (
        <Select
            label="Nomenclature"
            className={"fr-label--sm"}
            nativeSelectProps={{
                value: props.value as 'couverture' | 'usage',
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value as 'couverture' | 'usage';
                    props.onChange(value);
                }
            }}
            disabled={props.disabled}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Select>
    );
};

