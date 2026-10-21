import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import { SidePanelTitle } from "./SidePanelPrimitives";

interface SidePanelAccordionProps {
	title: ReactNode;
	defaultOpen?: boolean;
	open?: boolean;
	onToggle?: (open: boolean) => void;
	grow?: boolean;
	actions?: ReactNode;
	children: ReactNode;
}

const AccordionItem = styled.section<{ $grow?: boolean; $open: boolean }>`
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid ${theme.colors.border};
	flex: ${({ $grow, $open }) => $grow && $open ? "1 1 auto" : "0 0 auto"};
	min-height: 0;

	&:last-child {
		border-bottom: none;
	}
`;

const AccordionHeader = styled.div`
	display: flex;
	align-items: center;
	gap: ${theme.spacing.sm};
	padding: ${theme.spacing.sm} ${theme.spacing.md};
	flex-shrink: 0;
`;

const AccordionToggle = styled.button<{ $open: boolean }>`
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${theme.spacing.sm};
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	text-align: left;
	color: ${theme.colors.text};

	i {
		font-size: ${theme.fontSize.xs};
		color: ${theme.colors.textMuted};
		transition: transform 0.15s ease;
		transform: rotate(${({ $open }) => $open ? "180deg" : "0deg"});
		flex-shrink: 0;
	}
`;

const AccordionBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${theme.spacing.md};
	padding: 0 ${theme.spacing.md} ${theme.spacing.md};
	flex: 1;
	min-height: 0;
	overflow-y: auto;
`;

export const SidePanelAccordion: React.FC<SidePanelAccordionProps> = ({
	title,
	defaultOpen = true,
	open: controlledOpen,
	onToggle,
	grow = false,
	actions,
	children,
}) => {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const open = controlledOpen ?? internalOpen;
	const toggle = () => {
		const next = !open;
		setInternalOpen(next);
		onToggle?.(next);
	};

	return (
		<AccordionItem $grow={grow} $open={open}>
			<AccordionHeader>
				<AccordionToggle
					type="button"
					$open={open}
					aria-expanded={open}
					onClick={toggle}
				>
					<SidePanelTitle>{title}</SidePanelTitle>
					<i className="bi bi-chevron-down" aria-hidden="true" />
				</AccordionToggle>
				{actions}
			</AccordionHeader>
			{open && <AccordionBody>{children}</AccordionBody>}
		</AccordionItem>
	);
};
