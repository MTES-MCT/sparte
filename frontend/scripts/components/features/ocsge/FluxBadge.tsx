import React from 'react';
import { formatNumber } from '@utils/formatUtils';

interface FluxBadgeProps {
	flux: number;
}

export const FluxBadge: React.FC<FluxBadgeProps> = ({ flux }) => {
	return (
		<span
			className={`fr-badge ${
				flux >= 0 ? "fr-badge--error" : "fr-badge--success"
			} fr-badge--sm fr-badge--no-icon`}
		>
			{formatNumber({
				number: flux,
				addSymbol: true,
			})}{" "}
			ha
			{flux >= 0 ? (
				<i className="bi bi-arrow-up-right fr-ml-1w" />
			) : (
				<i className="bi bi-arrow-down-right fr-ml-1w" />
			)}
		</span>
	);
};
