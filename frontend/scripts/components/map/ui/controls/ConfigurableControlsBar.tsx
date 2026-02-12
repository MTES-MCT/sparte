import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { Control } from "../../types/controls";
import type { ControlsManager } from "../../controls/ControlsManager";

const Bar = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;

	.fr-select-group {
		margin-bottom: 0;
	}
`;

interface ConfigurableControlsBarProps {
	controls: Control[];
	manager: ControlsManager;
}

export const ConfigurableControlsBar: React.FC<ConfigurableControlsBarProps> = ({
	controls,
	manager,
}) => {
	const [, setTick] = useState(0);

	useEffect(() => {
		const unsubscribe = manager.subscribe(() => {
			setTick(prev => prev + 1);
		});
		return unsubscribe;
	}, [manager]);

	return (
		<Bar>
			{controls.map((control) => {
				const controlInstance = manager.getControlInstance(control.id);
				if (!controlInstance) return null;

				const value = manager.getControlValue(control.id);

				return (
					<React.Fragment key={control.id}>
						{controlInstance.createUI({
							control,
							value,
							disabled: false,
							onChange: (newValue) => {
								manager.applyControl(control.id, newValue);
							},
							layerId: control.targetLayers[0],
							context: manager.getControlContext(control.id),
						})}
					</React.Fragment>
				);
			})}
		</Bar>
	);
};
