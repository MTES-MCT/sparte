import React from "react";
import { Range } from "@codegouvfr/react-dsfr/Range";
import type { ControlUIProps } from "../../types/controls";

export const OpacityControl: React.FC<ControlUIProps> = (props) => {
    return (
        <Range
            hideMinMax={true}
            small={true}
            min={0}
            max={1}
            step={0.1}
            label="Opacité"
            classes={{ label: "fr-text--sm fr-mb-0" }}
            disabled={props.disabled}
            nativeInputProps={{
                value: props.value as number,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    props.onChange(parseFloat(e.target.value))
            }}
        />
    );
};

