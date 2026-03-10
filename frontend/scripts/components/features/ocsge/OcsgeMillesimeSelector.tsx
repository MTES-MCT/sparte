import React from "react";
import Button from "@components/ui/Button";
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
	<div className="d-flex gap-2" style={{ flexWrap: "wrap", background: "white", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", width: "fit-content" }}>
		{millesimes_by_index.map((m) => (
			<Button
				key={m.index}
				type="button"
				variant={m.index === index ? "primary" : "secondary"}
				size="sm"
				onClick={() => setIndex(m.index)}
				title={m.years}
			>
				{isDepartemental ? `Millésime n°${m.index}` : m.years}
			</Button>
		))}
	</div>
);