import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import type { ControlUIProps, OcsgeMillesimeControl as OcsgeMillesimeControlType } from "../../types/controls";
import type { SourceInterface } from "../../types/sourceInterface";

export const OcsgeMillesimeControl: React.FC<ControlUIProps> = (props) => {
    const control = props.control as OcsgeMillesimeControlType;

    let options: Array<{ value: number; label: string }> = [];
    if (props.context?.sources) {
        const source = props.context.sources.get(control.sourceId) as SourceInterface;
        if (source?.getAvailableMillesimes) {
            options = source.getAvailableMillesimes();
        }
    }

    return (
        <Select
            label="Millésime"
            className={"fr-label--sm"}
            nativeSelectProps={{
                value: props.value as number,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                    props.onChange(parseInt(e.target.value, 10))
            }}
            disabled={props.disabled}
        >
            {options.map((option: { value: number; label: string }) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Select>
    );
};

