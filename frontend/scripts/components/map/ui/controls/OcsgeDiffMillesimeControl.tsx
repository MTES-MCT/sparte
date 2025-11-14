import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import type { ControlUIProps, OcsgeDiffMillesimeControl as OcsgeDiffMillesimeControlType } from "../../types/controls";
import type { SourceInterface } from "../../types/sourceInterface";

export const OcsgeDiffMillesimeControl: React.FC<ControlUIProps> = (props) => {
    const control = props.control as OcsgeDiffMillesimeControlType;

    let options: Array<{ value: string; label: string }> = [];
    if (props.context?.sources) {
        const source = props.context.sources.get(control.sourceId) as SourceInterface;
        if (source?.getAvailableMillesimePairs) {
            const pairs = source.getAvailableMillesimePairs();
            options = pairs.map((pair) => {
                const baseLabel = pair.startYear && pair.endYear 
                    ? `${pair.startYear} - ${pair.endYear}` 
                    : `Index ${pair.startIndex} - ${pair.endIndex}`;
                const label = pair.departementName 
                    ? `${baseLabel} (${pair.departementName})` 
                    : baseLabel;
                
                return {
                    value: `${pair.startIndex}_${pair.endIndex}_${pair.departement || ''}`,
                    label
                };
            });
        }
    }

    return (
        <Select
            label="Période"
            className={"fr-label--sm"}
            nativeSelectProps={{
                value: props.value as string,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                    props.onChange(e.target.value)
            }}
            disabled={props.disabled}
        >
            {options.map((option: { value: string; label: string }) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Select>
    );
};

