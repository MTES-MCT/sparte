import styled from "styled-components";

export const MapWithSidePanel = styled.div`
	.maplibregl-ctrl-top-right {
		right: calc(34% + 1.5rem);
	}
`;

export const SidePanel = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	width: calc(33% + 1.5rem);
	height: 100%;
	background: #f6f6f6;
	border-left: 1.5rem solid #f8f9ff;
	padding: 1rem;
	font-size: 0.85rem;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	z-index: 5;
	box-sizing: border-box;

	@media (max-width: 768px) {
		width: 100%;
	}
`;
