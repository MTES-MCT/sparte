import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { LayerControlsConfig, LayerVisibility, ControlView } from "../types";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { OcsgeMultiSelectControl } from "./OcsgeMultiSelectControl";

const ToogleButton = styled(Button)`
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

const LayerItem = styled.div`
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

const LayerInfo = styled.div`
	flex: 1;
`;

const LayerInfoIcons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
`;

const LayerName = styled.h4`
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

const ControlItem = styled.div`
    padding: 1.2rem 1.3rem;
    border-top: 1px solid #EBEBEC;

    &:first-child {
        border-top: none;
    }

	.fr-label {
		padding-bottom: 0 !important;
	}
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
		<>
			<ToogleButton
				iconId={isOpen ? "fr-icon-arrow-down-s-fill" : "fr-icon-arrow-up-s-fill"}
				iconPosition="right"
				onClick={() => setIsOpen(!isOpen)}
				size="small"
			>
				<i className="bi bi-layers-fill fr-mr-1w"></i> Calques
			</ToogleButton>
			<ControlPanel $isOpen={isOpen}>
				<SlidingContainer $showDetails={!!selectedLayerId}>
					<SlidingContainerSection>
						<SectionHeader>
							<SectionTitle>Paramètres de la carte</SectionTitle>
							<SectionSubtitle>Sélectionnez un calque pour configurer ses paramètres.</SectionSubtitle>
						</SectionHeader>
						
						<SectionContent>
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
						</SectionContent>
					</SlidingContainerSection>

					<SlidingContainerSection>
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
                                            <ControlItem key={control.id}>
                                                {control.type === 'slider' ? (
													<Range
														hideMinMax
														small
                                                        min={control.min as number}
                                                        max={control.max as number}
                                                        step={(control as any).step || 1}
														label={control.label}
														classes={{ label: "fr-text--sm fr-mb-0" }}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
														nativeInputProps={{
                                                            value: control.value as number,
                                                            onChange: control.disabledWhenHidden && !selectedLayer.visible ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => orchestrator.applyLayerControl(selectedLayer.id, control.id, parseFloat(e.target.value))
														}}
													/>
                                                ) : control.type === 'multiselect' ? (
                                                    <OcsgeMultiSelectControl
                                                        label={control.label}
                                                        value={control.value as string[]}
                                                        options={(control as any).options as Array<{ value: string; label: string }>}
                                                        nomenclature={(() => {
                                                            const nCtrl = controls.find(c => c.id === 'nomenclature');
                                                            return (nCtrl?.value as 'couverture' | 'usage') || 'couverture';
                                                        })()}
                                                        onChange={control.disabledWhenHidden && !selectedLayer.visible ? undefined : (v) => orchestrator.applyLayerControl(selectedLayer.id, control.id, v)}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
                                                    />
                                                ) : control.type === 'select' ? (
                                                    <Select
														label={ (
															<span className="fr-text--sm">{control.label}</span>
														)}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
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
                                                        classes={{ label: "fr-text--sm fr-mb-0" }}
                                                        disabled={control.disabledWhenHidden ? !selectedLayer.visible : false}
                                                    />
                                                ) : null}
											</ControlItem>
										))}
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
