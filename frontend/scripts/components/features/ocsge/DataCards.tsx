import React from 'react';
import Card from '@components/ui/Card';
import { formatNumber } from '@utils/formatUtils';

interface DataCardsProps {
	icon: string;
	fluxBadgeLabel: string;
	stockBadgeLabel: string;
	fluxValue: number;
	fluxLabel: React.ReactNode;
	stockValue: React.ReactNode;
	stockLabel: React.ReactNode;
}

export const DataCards: React.FC<DataCardsProps> = ({
	icon,
	fluxBadgeLabel,
	stockBadgeLabel,
	fluxValue,
	fluxLabel,
	stockValue,
	stockLabel,
}) => {
	return (
		<>
			<div className="fr-col-12 fr-col-md-3">
				<Card
					icon={icon}
					badgeClass="fr-badge--error"
					badgeLabel={fluxBadgeLabel}
					value={`${formatNumber({ number: fluxValue, addSymbol: true })} ha`}
					label={fluxLabel}
					isHighlighted={true}
					highlightBadge="Donnée clé"
				/>
			</div>
			<div className="fr-col-12 fr-col-md-3">
				<Card
					icon={icon}
					badgeClass="fr-badge--info"
					badgeLabel={stockBadgeLabel}
					value={stockValue}
					label={stockLabel}
					isHighlighted={false}
				/>
			</div>
		</>
	);
};
