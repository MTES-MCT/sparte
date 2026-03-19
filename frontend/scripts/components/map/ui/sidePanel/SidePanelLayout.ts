import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";

export const MapWithSidePanel = styled.div`
	.maplibregl-ctrl-top-right {
		right: calc(33% + ${theme.spacing.lg});
	}
`;

export const SidePanel = styled(BaseCard)`
	position: absolute;
	top: ${theme.spacing.sm};
	right: ${theme.spacing.sm};
	bottom: calc(${theme.spacing.sm} + 18px);
	width: calc(33% - ${theme.spacing.sm});
	display: flex;
	flex-direction: column;
	z-index: 1;
	box-sizing: border-box;

	@media (max-width: 768px) {
		width: calc(100% - ${theme.spacing.md});
		left: ${theme.spacing.sm};
	}
`;
