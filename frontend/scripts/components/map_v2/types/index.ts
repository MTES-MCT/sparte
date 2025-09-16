import type { FeatureCollection as GeoJSONFeatureCollection } from "geojson";

export type FeatureCollection = GeoJSONFeatureCollection;

export type MapSource =
  | {
      id: string;
      type: "geojson";
      data: FeatureCollection;
    }
  | {
      id: string;
      type: "vector";
      url?: string;
      tiles?: string[];
    }
  | {
      id: string;
      type: "raster";
      tiles: string[];
      tileSize: number;
    };

export interface BaseStyle {
  color?: string;
  opacity?: number;
}

export interface LineStyle extends BaseStyle {
  width?: number;
  lineCap?: "round" | "butt" | "square";
}

export interface RasterStyle extends BaseStyle {
  opacity?: number;
}

interface BaseLayer {
  id: string;
  source: string;
}

export interface LineMapLayer extends BaseLayer {
  type: "line";
  style?: LineStyle;
}

export interface RasterMapLayer extends BaseLayer {
  type: "raster";
  style?: RasterStyle;
}

export type MapLayer = LineMapLayer | RasterMapLayer;

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