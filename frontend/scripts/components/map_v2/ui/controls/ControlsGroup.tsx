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

                    const targetLayers = control.targetLayers;
                    const firstLayerId = targetLayers[0];

                    // Récupérer la valeur actuelle depuis la carte
                    const value = manager.getControlValue(firstLayerId, control.id);
                    
                    const isGroupVisible = manager.isGroupActive(group.id);
                    const disabled = control.disabled ?? 
                        (controlInstance.shouldDisableWhenGroupHidden() && !isGroupVisible);

                    return (
                        <div key={control.id}>
                            {controlInstance.createUI({
                                control,
                                value,
                                disabled,
                                onChange: (newValue: any) => {
                                    manager.applyControl(firstLayerId, control.id, newValue);
                                },
                                layerId: firstLayerId
                            })}
                        </div>
                    );
                })}
            </ControlsList>
        </GroupContainer>
    );
};
