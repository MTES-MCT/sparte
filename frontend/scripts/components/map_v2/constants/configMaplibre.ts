export const MAPLIBRE_CONTROLS = {
  scrollZoom: true,
  navigationControl: true,
  fullscreenControl: true,
  cooperativeGestures: true,
} as const;

export const MAPLIBRE_STYLES = {
  EMPRISE: {
    color: "black",
    width: 1.7,
    opacity: 0.7,
    lineCap: "round" as const,
  },
  ORTHOPHOTO: {
    opacity: 1,
  },
} as const;
