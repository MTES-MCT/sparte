import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { PopupState, LayerPopupConfig } from "../../types/popup";

const PopupContainer = styled.div<{ 
  	$isVisible: boolean; 
}>`
	position: absolute;
	max-width: 400px;
	min-width: 50%;
	background: white;
	border-radius: 3px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	opacity: ${props => props.$isVisible ? 1 : 0};
	visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
	transition: opacity 0.2s ease, visibility 0.2s ease;
	pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

const PopupTitle = styled.div`
	font-size: 0.875rem;
	font-weight: 600;
	color: #1e1e1e;
	margin-bottom: 0.75rem;
	padding-bottom: 0.8rem;
	border-bottom: 1px solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const PopupContent = styled.div`
	padding: 1rem 0.75rem;
	font-size: 0.875rem;
	line-height: 1.4;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	font-size: 1.2rem;
	cursor: pointer;
	color: #666;
	padding: 0;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&:hover {
		color: #333;
	}
`;

interface PopupPanelProps {
	popupState: PopupState;
	popupConfig: LayerPopupConfig | null;
	onClose: () => void;
	mapContainer: HTMLElement | null;
}

export const PopupPanel: React.FC<PopupPanelProps> = ({
	popupState,
	popupConfig,
	onClose,
	mapContainer
}) => {
	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!popupState.isVisible || !popupRef.current || !mapContainer) return;

		const popup = popupRef.current;
		const mapRect = mapContainer.getBoundingClientRect();
		
		let x = popupState.position.x;
		let y = popupState.position.y;
		
		const updatePosition = () => {
			const popupRect = popup.getBoundingClientRect();
			const margin = 10;
			
			if (x - popupRect.width / 2 < margin) {
				x = margin + popupRect.width / 2;
			} else if (x + popupRect.width / 2 > mapRect.width - margin) {
				x = mapRect.width - margin - popupRect.width / 2;
			}
			
			if (y - popupRect.height - 10 < margin) {
				y = y + 20;
				popup.style.transform = 'translate(-50%, 0)';
				popup.style.marginTop = '10px';
			} else {
				popup.style.transform = 'translate(-50%, -100%)';
				popup.style.marginTop = '-10px';
			}
			
			popup.style.left = `${x}px`;
			popup.style.top = `${y}px`;
		};
		
		requestAnimationFrame(updatePosition);
	}, [popupState.isVisible, popupState.position, mapContainer]);

	if (!popupState.isVisible || !popupConfig || !popupState.feature) {
		return null;
	}

	const content = popupConfig.renderContent(popupState.feature, popupState.event);

		return (
			<PopupContainer
				ref={popupRef}
				$isVisible={popupState.isVisible}
			>
				<PopupContent>
					<PopupTitle>
						<span>{popupConfig.title}</span>
						<CloseButton onClick={onClose} title="Fermer">
							×
						</CloseButton>
					</PopupTitle>
					{content}
				</PopupContent>
			</PopupContainer>
		);
};
