import React from "react";
import styled from "styled-components";

export const ZONE_TYPE_COLORS: Record<string, string> = {
	U: "#E63946",
	AU: "#F4A261",
	N: "#2A9D8F",
	A: "#E9C46A",
};

const Badge = styled.span<{ $color: string }>`
	display: inline-block;
	padding: 2px 6px;
	border-radius: 3px;
	background-color: ${({ $color }) => $color};
	color: white;
	font-weight: 600;
	font-size: 0.8rem;
`;

interface ZoneTypeBadgeProps {
	type: string;
	className?: string;
}

export const ZoneTypeBadge: React.FC<ZoneTypeBadgeProps> = ({ type, className }) => (
	<Badge $color={ZONE_TYPE_COLORS[type] || "#999"} className={className}>
		{type}
	</Badge>
);
