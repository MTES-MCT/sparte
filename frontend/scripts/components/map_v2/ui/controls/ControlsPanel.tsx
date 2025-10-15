import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ControlsGroup } from "./ControlsGroup";
import type { ControlsConfig } from "../../types/controls";
import type { ControlsManager } from "../../controls/ControlsManager";

const ToggleButton = styled(Button)`
    position: absolute;
    bottom: 1vw;
    left: 1vw;
    z-index: 2;
`;

const ControlPanel = styled.div<{ $isOpen: boolean }>`
    position: absolute;
    bottom: 1vw;
    left: 1vw;
	top: 1vw;
	width: 25vw;
    z-index: 1;
    background: #ffffff;
    overflow: hidden;
	opacity: ${props => props.$isOpen ? 1 : 0};
	visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
	transition: opacity 0.1s ease, visibility 0.1s ease;
	padding-bottom: 32px;
`;

const SlidingContainer = styled.div<{ $showDetails: boolean }>`
    width: 200%;
	height: 100%;
	display: flex;
    transform: translateX(${props => props.$showDetails ? '-50%' : '0'});
    transition: transform 0.3s ease;
`;

const SlidingContainerSection = styled.div`
    display: flex;
	flex-direction: column;
    width: 50%;
	height: 100%;
`;

const SectionHeader = styled.div`
	padding: 1em 1.2em;
	border-bottom: 1px solid #EBEBEC;
	background: #f8f9ff;
`;

const SectionContent = styled.div`
	flex-grow: 1;
	overflow-y: auto;
`;

const SectionTitle = styled.div`
	margin: 0.5em 0 0.2em 0;
	font-size: 0.95em;
	font-weight: 500;
	color: #161616;
`;

const SectionSubtitle = styled.p`
	font-size: 0.75em;
	color: #666;
	margin-bottom: 0;
`;

const GroupItem = styled.div`
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #EBEBEC;
    cursor: pointer;
	display: flex;
	align-items: center;
    
    &:hover {
        background: #f8f9ff;
    }
    
    &:last-child {
        border-bottom: none;
    }
`;

const GroupName = styled.div`
	flex: 1;
`;

const GroupVisibilityIcons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
`;

const GroupLabel = styled.h4`
	margin: 0 0 2px 0;
	font-size: 14px;
	font-weight: 500;
	color: #161616;
`;

const ChevronIcon = styled.svg`
    width: 1rem;
    height: 1rem;
`;

const ControlsContainer = styled.div`
	overflow-y: auto;
`;

interface ControlsPanelProps {
	config: ControlsConfig;
	manager: ControlsManager;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
	config,
	manager,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [_forceUpdate, setForceUpdate] = useState(0);

	useEffect(() => {
		const unsubscribe = manager.subscribe(() => {
			setForceUpdate(prev => prev + 1);
		});
		
		return unsubscribe;
	}, [manager]);

	if (!config.groups?.length) {
		return null;
	}

	const groups = manager.getGroups();
	const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;

	return (
		<>
			<ToggleButton
				iconId={isOpen ? "fr-icon-arrow-down-s-fill" : "fr-icon-arrow-up-s-fill"}
				iconPosition="right"
				onClick={() => setIsOpen(!isOpen)}
				size="small"
			>
				<i className="bi bi-layers-fill fr-mr-1w"></i> Calques
			</ToggleButton>
			<ControlPanel $isOpen={isOpen}>
				<SlidingContainer $showDetails={!!selectedGroupId}>
					<SlidingContainerSection>
						<SectionHeader>
							<SectionTitle>Paramètres de la carte</SectionTitle>
							<SectionSubtitle>Sélectionnez un groupe pour configurer ses paramètres.</SectionSubtitle>
						</SectionHeader>
						
						<SectionContent>
							{groups.map((group) => {
								const isGroupActive = manager.isGroupVisible(group.id);

								return (
									<GroupItem
										key={group.id}
										onClick={() => setSelectedGroupId(group.id)}
									>
										<GroupName>
											<GroupLabel>{group.label}</GroupLabel>
										</GroupName>
										<GroupVisibilityIcons>
											<i className={isGroupActive ? 'bi bi-eye' : 'bi bi-eye-slash'}></i>
											<ChevronIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M9 18l6-6-6-6" />
											</ChevronIcon>
										</GroupVisibilityIcons>
									</GroupItem>
								);
							})}
						</SectionContent>
					</SlidingContainerSection>

					<SlidingContainerSection>
						{selectedGroup && (
							<>
								<SectionHeader>
									<div className="fr-flex fr-flex-align-center fr-flex-gap-8">
										<Button
											iconId="fr-icon-arrow-left-line"
											priority="tertiary no outline"
											size="small"
											onClick={() => setSelectedGroupId(null)}
										>
											Retour à la liste
										</Button>
										<div>
											<SectionTitle>{selectedGroup.label}</SectionTitle>
											<SectionSubtitle>{selectedGroup.description}</SectionSubtitle>
										</div>
									</div>
								</SectionHeader>
								
								<SectionContent>
									<ControlsContainer>
										<ControlsGroup
											group={selectedGroup}
											manager={manager}
										/>
									</ControlsContainer>
								</SectionContent>
							</>
						)}
					</SlidingContainerSection>
				</SlidingContainer>				
			</ControlPanel>
		</>
	);
};
