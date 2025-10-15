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
    const isGroupVisible = manager.isGroupVisible(group.id);

    return (
        <GroupContainer>
            <ControlsList>
                {group.controls.map((control) => {
                    const controlInstance = manager.getControlInstance(control.id);
                    if (!controlInstance) return null;

                    const targetLayers = control.targetLayers;
                    const firstLayerId = targetLayers[0];

                    const value = manager.getControlValue(control.id);
                    
                    const disabled = control.disabled ?? 
                        (control.type !== 'visibility' && !isGroupVisible);

                    return (
                        <div key={control.id}>
                            {controlInstance.createUI({
                                control,
                                value,
                                disabled,
                                        onChange: (newValue: any) => {
                                            manager.applyControl(control.id, newValue);
                                        },
                                layerId: firstLayerId,
                                context: manager.getControlContext(control.id)
                            })}
                        </div>
                    );
                })}
            </ControlsList>
        </GroupContainer>
    );
};
