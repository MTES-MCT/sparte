// Theme Light
// Adaptation du dsfr pour le dashboard

export const theme = {
  // ─── Couleurs de base ───
  colors: {
    // DSFR Core
    primary: "#000091",
    primaryLight: "#e3e3fd",
    primaryDark: "#2a2a8a",

    // Accent pour interactions (bleu info DSFR)
    accent: "#0063cb",
    accentLight: "#e8edff",

    // Texte
    text: "var(--text-title-grey)",
    textLight: "var(--text-mention-grey)",
    textMuted: "#666666",

    // Fonds
    background: "#ffffff",
    backgroundAlt: "#f6f6f6",
    backgroundSubtle: "#f9fafb",

    // Bordures
    border: "#ebebec",

    // Sémantiques
    success: "#059669",
    successBg: "#ecfdf5",
    successBorder: "#bce3d5",

    warning: "#b34000",
    warningBg: "#fff4f3",

    error: "#dc2626",
    errorBg: "#fef2f2",
    errorBorder: "#f0d4d4",

    info: "#4318FF",
    infoLight: "#f0f0ff",
    infoBorder: "#dbd8eb",

    // Notation par étoiles
    star: "#fbbf24",
  },

  // ─── Boutons ───
  button: {
    primary: {
      background: "#000091",
      color: "#ffffff",
      backgroundHover: "#000074",
    },
    secondary: {
      background: "#e3e3fd",
      color: "#000091",
      backgroundHover: "#cacafb",
    },
    link: {
      background: "transparent",
      color: "#000091",
      backgroundHover: "transparent",
    },
    outline: {
      background: "transparent",
      color: "#000091",
      border: "#000091",
      backgroundHover: "#e3e3fd",
    },
  },

  // ─── Badges ───
  badge: {
    neutral: {
      background: "#eeeeee",
      color: "#3a3a3a",
    },
    active: {
      background: "#e3e3fd",
      color: "#000091",
    },
    info: {
      background: "#f0f0ff",
      color: "#4318FF",
    },
  },

  // ─── Liens ───
  link: {
    color: "#000091",
  },

  // ─── Typographie ───
  fontSize: {
    xs: "0.7rem",
    sm: "0.82rem",
    md: "0.95rem",
    lg: "1.15rem",
    xl: "1.35rem",
    xxl: "1.75rem",
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // ─── Espacements ───
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },

  // ─── Radius ───
  radius: {
    card: "8px",
    element: "6px",
  },

  // ─── Ombres ───
  shadow: {
    md: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
    lg: "0 4px 6px rgba(0, 0, 0, 0.03), 0 12px 24px rgba(0, 0, 0, 0.06)",
  },
} as const;

export type Theme = typeof theme;
