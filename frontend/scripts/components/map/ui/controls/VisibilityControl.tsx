import React from "react";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import type { ControlUIProps } from "../../types/controls";

export const VisibilityControl: React.FC<ControlUIProps> = (props) => {
    return (
        <ToggleSwitch
            inputTitle="Visibilité"
            label="Visibilité"
            labelPosition="left"
            checked={props.value as boolean}
            onChange={props.onChange}
            classes={{ label: "fr-text--sm fr-mb-0" }}
            disabled={props.disabled}
        />
    );
};

