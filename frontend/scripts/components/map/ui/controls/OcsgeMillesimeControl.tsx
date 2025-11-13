import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import type { ControlUIProps, OcsgeMillesimeControl as OcsgeMillesimeControlType } from "../../types/controls";
import type { SourceInterface } from "../../types/sourceInterface";

export const OcsgeMillesimeControl: React.FC<ControlUIProps> = (props) => {
    const control = props.control as OcsgeMillesimeControlType;

    let options: Array<{ value: string; label: string }> = [];
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

