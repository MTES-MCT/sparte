import styled from "styled-components";
import { theme } from "@theme";

export const SidePanelPlaceholder = styled.div`
	color: ${theme.colors.textMuted};
	font-size: ${theme.fontSize.sm};
	text-align: center;
	padding: ${theme.spacing.lg} ${theme.spacing.md};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	gap: ${theme.spacing.sm};
`;

export const PlaceholderIcon = styled.div`
	font-size: 1.5rem;
	opacity: 0.5;
`;

export const SidePanelHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${theme.spacing.sm};
	padding: ${theme.spacing.md};
	border-bottom: 1px solid ${theme.colors.border};
	flex-shrink: 0;
`;

export const HeaderContent = styled.div`
	flex: 1;
	min-width: 0;
`;

export const SidePanelTitle = styled.h4`
	margin: 0;
	font-size: ${theme.fontSize.sm};
	font-weight: ${theme.fontWeight.semibold};
	color: ${theme.colors.text};
	line-height: 1.3;
`;

export const SidePanelSubtitle = styled.div`
	font-size: ${theme.fontSize.xs};
	color: ${theme.colors.textMuted};
	margin-top: 2px;
`;

export const CloseButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	font-size: ${theme.fontSize.sm};
	color: ${theme.colors.textMuted};
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${theme.radius.default};
	flex-shrink: 0;
	transition: all 0.15s ease;

	&:hover {
		color: ${theme.colors.text};
		background: ${theme.colors.backgroundMuted};
	}
`;

export const SectionTitle = styled.div`
	font-weight: ${theme.fontWeight.semibold};
	font-size: ${theme.fontSize.xs};
	color: ${theme.colors.text};
	margin-bottom: ${theme.spacing.xs};
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const Separator = styled.div`
	border-top: 1px solid ${theme.colors.border};
`;

export const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	padding: 2px 0;
	font-size: ${theme.fontSize.xs};
	gap: ${theme.spacing.md};
	line-height: 1.4;
`;

export const InfoLabel = styled.span`
	color: ${theme.colors.textMuted};
	flex-shrink: 0;
`;

export const InfoValue = styled.span`
	font-weight: ${theme.fontWeight.medium};
	color: ${theme.colors.text};
	text-align: right;
	display: flex;
	align-items: center;
	gap: 4px;
`;

export const ColorDot = styled.span<{ $color: string }>`
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 3px;
	background-color: ${({ $color }) => $color};
	flex-shrink: 0;
`;

export const SidePanelContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${theme.spacing.md};
	padding: ${theme.spacing.md};
	flex: 1;
	min-height: 0;
	overflow-y: auto;
`;
