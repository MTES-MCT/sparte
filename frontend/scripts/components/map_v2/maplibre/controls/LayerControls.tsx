import React from "react";
import styled from "styled-components";
import { LayerControlsConfig, LayerVisibility } from "../../types";

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 10;
  min-width: 240px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LayerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  
  &:last-child {
    border-bottom: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: #007bff;
`;

const Label = styled.label`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OpacityContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 12px;
  min-width: 80px;
`;

const OpacitySlider = styled.input`
  width: 60px;
  height: 4px;
  border-radius: 2px;
  background: #ddd;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const OpacityValue = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  min-width: 30px;
  text-align: right;
`;

interface LayerControlsProps {
  layers: LayerVisibility[];
  config: LayerControlsConfig;
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  config,
  onLayerToggle,
  onOpacityChange,
}) => {
  if (!config.showControls || layers.length === 0) {
    return null;
  }

  return (
    <ControlsContainer>
      <Title>Couches</Title>
      {layers.map((layer) => (
        <LayerItem key={layer.id}>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id={`layer-${layer.id}`}
              checked={layer.visible}
              onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
            />
            <Label htmlFor={`layer-${layer.id}`}>
              {layer.name}
            </Label>
          </CheckboxContainer>
          {layer.visible && layer.opacity !== undefined && (
            <OpacityContainer>
              <OpacitySlider
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={layer.opacity}
                onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
              />
              <OpacityValue>
                {Math.round(layer.opacity * 100)}%
              </OpacityValue>
            </OpacityContainer>
          )}
        </LayerItem>
      ))}
    </ControlsContainer>
  );
};
