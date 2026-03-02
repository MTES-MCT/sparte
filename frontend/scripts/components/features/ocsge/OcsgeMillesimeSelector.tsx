import React from "react";
import Button from "@components/ui/Button";
import { MillesimeByIndex } from "@services/types/land";
import styled from "styled-components";
import { theme } from "@theme";

const Container = styled.div`
	display: flex;
	gap: ${theme.spacing.sm};
`;

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
	<Container>
		{millesimes_by_index.map((m) => (
			<Button
				type="button"
				variant={m.index === index ? "primary" : "outline"}
				onClick={() => setIndex(m.index)}
				title={m.years}
			>
				{isDepartemental ? `Millésime n°${m.index}` : m.years}
			</Button>
		))}
	</Container>
); 