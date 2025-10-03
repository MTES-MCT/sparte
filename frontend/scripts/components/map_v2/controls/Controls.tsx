import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { LayerControlsConfig, LayerVisibility, ControlView } from "../types";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { MultiSelectControl } from "./MultiSelectControl";

const ControlPanel = styled.div<{ $isOpen: boolean }>`
	position: absolute;
	bottom: 20px;
	left: 20px;
	z-index: 1000;
	background: #ffffff;
	overflow: hidden;
	display: flex;
	flex-direction: column-reverse;
	
	${props => props.$isOpen ? `
		width: 380px;
		top: 20px;
	` : `
		width: auto;
	`}
`;

const SlidingContainer = styled.div<{ $showDetails: boolean }>`
	display: flex;
	width: 760px;
	transform: translateX(${props => props.$showDetails ? '-380px' : '0px'});
	transition: transform 0.3s ease;
	flex-grow: 1;
`;

const LayerListSection = styled.div`
	width: 380px;
	flex-shrink: 0;
`;

const LayerDetailsSection = styled.div`
	width: 380px;
	flex-shrink: 0;
	border-left: 1px solid #EBEBEC;
`;

const SectionHeader = styled.div`
	padding: 1em 1.2em;
	border-bottom: 1px solid #EBEBEC;
	background: #f8f9ff;
`;

const SectionTitle = styled.div`
	margin: 0.5em 0 0.2em 0;
	font-size: 1em;
	font-weight: 500;
	color: #161616;
`;

const SectionSubtitle = styled.p`
	font-size: 0.75em;
	color: #666;
	margin-bottom: 0;
`;

const SectionContent = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 0;
`;

const LayerList = styled.div`
	padding: 0;
`;

const LayerItem = styled.div`
	padding: 12px 20px;
	border-bottom: 1px solid #eee;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 12px;
	
	&:hover {
		background: #f8f9ff;
	}
	
	&:last-child {
		border-bottom: none;
	}
`;

const LayerInfo = styled.div`
	flex: 1;
`;

const LayerInfoIcons = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: #666;
`;

const LayerName = styled.h4`
	margin: 0 0 2px 0;
	font-size: 14px;
	font-weight: 500;
	color: #161616;
`;

const ChevronIcon = styled.svg`
	width: 16px;
	height: 16px;
`;

const ControlsContainer = styled.div`
	padding: 16px;
	max-height: 400px;
	overflow-y: auto;
`;

const ControlItem = styled.div`
	margin-bottom: 16px;
	
	&:last-child {
		margin-bottom: 0;
	}
`;

const ControlLabel = styled.label`
	display: block;
	font-size: 13px;
	font-weight: 500;
	color: #161616;
	margin-bottom: 6px;
`;

interface LayerControlsProps {
	layers: LayerVisibility[];
	config: LayerControlsConfig;
	orchestrator: LayerOrchestrator;
}

export const Controls: React.FC<LayerControlsProps> = ({
	layers,
	config,
	orchestrator,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

	if (!config.showControls || layers.length === 0) {
		return null;
	}

	const selectedLayer = selectedLayerId ? layers.find(l => l.id === selectedLayerId) : null;
	const controls: ControlView[] = selectedLayerId ? orchestrator.getLayerControls(selectedLayerId) as any : [];

	return (
		<ControlPanel $isOpen={isOpen}>
			<Button
				iconId={isOpen ? "fr-icon-arrow-down-s-fill" : "fr-icon-arrow-up-s-fill"}
				iconPosition="right"
				onClick={() => setIsOpen(!isOpen)}
				size="small"
			>
				<i className="bi bi-layers-fill fr-mr-1w"></i> Calques
			</Button>

			{isOpen && (
				<SlidingContainer $showDetails={!!selectedLayerId}>
					<LayerListSection>
						<SectionHeader>
							<SectionTitle>Paramètres de la carte</SectionTitle>
							<SectionSubtitle>Sélectionnez un calque pour configurer ses paramètres.</SectionSubtitle>
						</SectionHeader>
						
						<SectionContent>
							<LayerList>
								{layers.map((layer) => (
									<LayerItem
										key={layer.id}
										onClick={() => setSelectedLayerId(layer.id)}
									>
										<LayerInfo>
											<LayerName>{layer.label}</LayerName>
										</LayerInfo>
										<LayerInfoIcons>
											<i className={layer.visible ? 'bi bi-eye' : 'bi bi-eye-slash'}></i>
											<ChevronIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M9 18l6-6-6-6" />
											</ChevronIcon>
										</LayerInfoIcons>
									</LayerItem>
								))}
							</LayerList>
						</SectionContent>
					</LayerListSection>

					<LayerDetailsSection>
						{selectedLayer && (
							<>
								<SectionHeader>
									<div className="fr-flex fr-flex-align-center fr-flex-gap-8">
										<Button
											iconId="fr-icon-arrow-left-line"
											priority="tertiary no outline"
											size="small"
											onClick={() => setSelectedLayerId(null)}
										>
											Retour à la liste
										</Button>
										<div>
											<SectionTitle>{selectedLayer.label}</SectionTitle>
											<SectionSubtitle>{orchestrator.getLayerDescription(selectedLayer.id)}</SectionSubtitle>
										</div>
									</div>
								</SectionHeader>
								
								<SectionContent>
									<ControlsContainer>
                                        {controls.map((control) => (
											<ControlItem
												key={control.id}
												style={{ opacity: control.id === 'visible' ? 1 : (selectedLayer.visible ? 1 : 0.5) }}
											>
                                                {control.type === 'slider' ? (
													<Range
														hideMinMax
														small
                                                        min={control.min as number}
                                                        max={control.max as number}
                                                        step={(control as any).step || 1}
														label=""
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
														nativeInputProps={{
                                                            value: control.value as number,
                                                            onChange: control.disabledWhenHidden && !selectedLayer.visible ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => orchestrator.applyLayerControl(selectedLayer.id, control.id, parseFloat(e.target.value))
														}}
													/>
                                                ) : control.type === 'multiselect' ? (
													<MultiSelectControl
                                                        value={control.value as string[]}
                                                        options={(control as any).options as Array<{ value: string; label: string }>}
                                                        onChange={control.disabledWhenHidden && !selectedLayer.visible ? undefined : (v) => orchestrator.applyLayerControl(selectedLayer.id, control.id, v)}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
													/>
												) : control.type === 'select' ? (
													<Select
														label=""
														nativeSelectProps={{
                                                            value: control.value as string,
                                                            onChange: control.disabledWhenHidden && !selectedLayer.visible ? undefined : (e) => orchestrator.applyLayerControl(selectedLayer.id, control.id, e.target.value),
                                                            disabled: control.disabledWhenHidden ? !selectedLayer.visible : false,
														}}
													>
                                                        {(control as any).options.map((option: { value: string; label: string }) => (
															<option key={option.value} value={option.value}>
																{option.label}
															</option>
														))}
													</Select>
                                                ) : control.type === 'toggle' ? (
                                                    <ToggleSwitch
                                                        inputTitle={control.label}
                                                        label={control.label}
                                                        labelPosition="left"
                                                        checked={!!(control.value as boolean)}
                                                        onChange={(checked) => orchestrator.applyLayerControl(selectedLayer.id, control.id, checked)}
                                                        classes={{ label: "fr-text--sm" }}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
                                                    />
                                                ) : null}
											</ControlItem>
										))}
									</ControlsContainer>
								</SectionContent>
							</>
						)}
					</LayerDetailsSection>
				</SlidingContainer>
			)}
		</ControlPanel>
	);
};





