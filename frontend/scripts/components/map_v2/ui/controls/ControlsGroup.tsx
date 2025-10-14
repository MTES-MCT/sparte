import React from "react";
import styled from "styled-components";
import type { ControlGroup } from "../../types/controls";
import type { ControlsManager } from "../../controls/ControlsManager";

const GroupContainer = styled.div`
    padding: 1.2rem 1.3rem;
    border-top: 1px solid #EBEBEC;

    &:first-child {
        border-top: none;
    }
`;

const ControlsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

interface ControlsGroupProps {
    group: ControlGroup;
    manager: ControlsManager;
}

export const ControlsGroup: React.FC<ControlsGroupProps> = ({
    group,
    manager,
}) => {
    return (
        <GroupContainer>
            <ControlsList>
                {group.controls.map((control) => {
                    const controlInstance = manager.getControlInstance(control.id);
                    if (!controlInstance) return null;

                    // Récupérer la valeur actuelle depuis la carte
                    const firstLayerId = group.targetLayers[0];
                    const value = manager.getControlValue(firstLayerId, control.id);
                    const disabled = control.disabled ?? false;

                    return (
                        <div key={control.id}>
                            {controlInstance.createUI({
                                control,
                                value,
                                disabled,
                                onChange: (newValue: any) => {
                                    group.targetLayers.forEach(layerId => {
                                        manager.applyControl(layerId, control.id, newValue);
                                    });
                                },
                                layerId: group.targetLayers[0]
                            })}
                        </div>
                    );
                })}
            </ControlsList>
        </GroupContainer>
    );
};
