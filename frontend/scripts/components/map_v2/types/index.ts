export interface LayerVisibility {
  id: string;
  name: string;
  visible: boolean;
  opacity?: number;
}

export interface LayerControlsConfig {
  layers: LayerVisibility[];
  showControls?: boolean;
}
