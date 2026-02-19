import styled from "styled-components";

export const SidePanelPlaceholder = styled.div`
	color: #666;
	font-style: italic;
	text-align: center;
	padding: 2rem 1rem;
	margin: auto 0;
`;

export const CloseButton = styled.button`
	position: absolute;
	top: 8px;
	right: 8px;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 1.1rem;
	color: #888;
	padding: 2px 6px;
	line-height: 1;
	border-radius: 3px;
	z-index: 1;
	&:hover {
		color: #333;
		background: #e0e0e0;
	}
`;

export const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	padding: 1px 0;
	font-size: 0.75rem;
`;

export const InfoLabel = styled.span`
	color: #666;
`;

export const InfoValue = styled.span`
	font-weight: 600;
	text-align: right;
`;

export const ColorDot = styled.span<{ $color: string }>`
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 2px;
	background-color: ${({ $color }) => $color};
	margin-right: 6px;
	vertical-align: middle;
	flex-shrink: 0;
`;
