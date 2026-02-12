import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { Control } from "../../types/controls";
import type { ControlsManager } from "../../controls/ControlsManager";

const Bar = styled.div`
	position: absolute;
	top: 0.5rem;
	left: 0.5rem;
	z-index: 2;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	gap: 0.5rem;
	padding: 0.25rem 0.6rem;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(4px);
	border-radius: 4px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

	.fr-select-group {
		margin-bottom: 0;
		display: flex;
		flex-direction: row;
		align-items: baseline;
		gap: 0.5rem;

		label {
			margin-bottom: 0;
			white-space: nowrap;
			padding: 0;
		}

		select {
			width: auto;
			padding-top: 0.25rem;
			padding-bottom: 0.25rem;
		}
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
