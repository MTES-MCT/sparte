import React from "react";
import styled from "styled-components";
import type { ControlGroup } from "../../types/controls";
import type { ControlsManager } from "../../controls/ControlsManager";

const GroupContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ControlContainer = styled.div`
    padding: 1.3rem;
    border-bottom: 1px solid #EBEBEC;
    
    &:last-child {
        border-bottom: none;
    }
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
            {group.controls.map((control) => {
                const controlInstance = manager.getControlInstance(control.id);
                if (!controlInstance) return null;

                const targetLayers = control.targetLayers;
                const firstLayerId = targetLayers[0];

                const value = manager.getControlValue(control.id);
                
                const disabled = control.disabled ?? 
                    (control.type !== 'visibility' && !isGroupVisible);

                return (
                    <ControlContainer key={control.id}>
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
                    </ControlContainer>
                );
            })}
        </GroupContainer>
    );
};
