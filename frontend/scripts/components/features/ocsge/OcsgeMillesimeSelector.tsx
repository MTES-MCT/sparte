import React from "react";
import { MillesimeByIndex } from "@services/types/land";

interface OcsgeMillesimeSelectorProps {
	index: number;
	setIndex: (index: number) => void;
	millesimes_by_index: MillesimeByIndex[];
	isDepartemental?: boolean;
}

export const OcsgeMillesimeSelector: React.FC<OcsgeMillesimeSelectorProps> = ({
	index,
	setIndex,
	millesimes_by_index,
	isDepartemental = false,
}) => (
	<ul className="fr-btns-group fr-btns-group--inline-sm">
		{millesimes_by_index.map((m) => (
			<li key={m.years}>
				<button
					type="button"
					className={`fr-btn ${m.index !== index ? "fr-btn--tertiary" : ""}`}
					onClick={() => setIndex(m.index)}
					title={m.years}
				>
					{isDepartemental ? `Millésime n°${m.index}` : m.years}
				</button>
			</li>
		))}
	</ul>
); 