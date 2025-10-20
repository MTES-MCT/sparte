import React from 'react';
import Card from '@components/ui/Card';
import { formatNumber } from '@utils/formatUtils';

interface DataCardsProps {
	icon: string;
	fluxBadgeLabel: string;
	stockBadgeLabel: string;
	fluxValue: number | React.ReactNode;
	fluxLabel: React.ReactNode;
	stockValue: React.ReactNode;
	stockLabel: React.ReactNode;
	fluxBadgeClass?: string;
	stockBadgeClass?: string;
}

export const DataCards: React.FC<DataCardsProps> = ({
	icon,
	fluxBadgeLabel,
	stockBadgeLabel,
	fluxValue,
	fluxLabel,
	stockValue,
	stockLabel,
	fluxBadgeClass = "fr-badge--error",
	stockBadgeClass = "fr-badge--info",
}) => {
	const formattedFluxValue = typeof fluxValue === 'number'
		? `${formatNumber({ number: fluxValue, addSymbol: true })} ha`
		: fluxValue;

	return (
		<>
			<div className="fr-col-12 fr-col-md-3">
				<Card
					icon={icon}
					badgeClass={fluxBadgeClass}
					badgeLabel={fluxBadgeLabel}
					value={formattedFluxValue}
					label={fluxLabel}
					isHighlighted={true}
					highlightBadge="Donnée clé"
				/>
			</div>
			<div className="fr-col-12 fr-col-md-3">
				<Card
					icon={icon}
					badgeClass={stockBadgeClass}
					badgeLabel={stockBadgeLabel}
					value={stockValue}
					label={stockLabel}
					isHighlighted={false}
				/>
			</div>
		</>
	);
};
