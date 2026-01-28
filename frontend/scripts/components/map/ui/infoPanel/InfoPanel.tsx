import React from "react";
import styled from "styled-components";
import { InfoPanelState, LayerInfoConfig } from "../../types/infoPanel";

const PanelContainer = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
    max-height: calc(100% - 20px);
    max-width: 320px;
    overflow-y: auto;
    z-index: 1000;
    pointer-events: none;
    font-size: 0.7rem;
`;

const LayerSection = styled.div`
    padding: 0.5rem;
    background: #ffffff;
    border-radius: 3px;
    margin-bottom: 0.3rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const LayerTitle = styled.div`
    font-size: 0.65rem;
    font-weight: 600;
`;

interface InfoPanelProps {
    state: InfoPanelState;
    configs: Map<string, LayerInfoConfig>;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ state, configs }) => {
    if (state.layers.length === 0) {
        return null;
    }

    return (
        <PanelContainer>
            {state.layers.map((layerInfo) => {
                const config = configs.get(layerInfo.layerId);
                if (!config) return null;

                return (
                    <LayerSection key={layerInfo.layerId}>
                        <LayerTitle>{layerInfo.title}</LayerTitle>
                        {config.renderContent(layerInfo.feature)}
                    </LayerSection>
                );
            })}
        </PanelContainer>
    );
};

