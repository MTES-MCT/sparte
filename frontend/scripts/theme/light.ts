// Theme Light
// Adaptation du dsfr pour le dashboard

export const theme = {
  // ─── Couleurs de base ───
  colors: {
    // DSFR Core
    primary: "#000091",
    primaryLight: "#e3e3fd",

    // Accent pour interactions (bleu info DSFR)
    accent: "#0063cb",
    accentLight: "#e8edff",

    // Highlight pour éléments actionnables (bleu électrique)
    highlight: "#4318FF",
    highlightLight: "#f0f0ff",
    highlightBorder: "rgba(67, 24, 255, 0.2)",

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
    borderLight: "#eeeeee",

    // Sémantiques DSFR
    success: "#18753c",
    successLight: "#b8fec9",
    successBg: "#f0fdf4",
    successBorder: "#d0e9da",

    warning: "#b34000",
    warningLight: "#ffe9e6",
    warningBg: "#fff4f3",

    error: "#ce0500",
    errorLight: "#ffe9e9",
    errorBg: "#fef2f2",
    errorBorder: "#e2aead",

    info: "#4318FF",
    infoLight: "#f0f0ff",
    infoBg: "#f0f0ff",
    infoBorder: "#dbd8eb",
  },

  // ─── Palette catégories (pour graphiques, tags, etc.) ───
  palette: {
    blue: "#0063cb",
    green: "#18753c",
    orange: "#d64d00",
    purple: "#6e445a",
    teal: "#00a88f",
    pink: "#a94645",
  },

  // ─── Cartes ───
  card: {
    background: "#ffffff",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
    radius: "8px",
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
    success: {
      background: "#dffee6",
      color: "#18753c",
    },
    warning: {
      background: "#fff4f3",
      color: "#b34000",
    },
    error: {
      background: "#fff4f4",
      color: "#ce0500",
    },
  },

  // ─── Icônes décoratives ───
  iconBadge: {
    background: "#e3e3fd",
    color: "#000091",
  },

  // ─── Liens ───
  link: {
    color: "#000091",
  },

  // ─── Typographie ───
  fontSize: {
    xs: "0.7rem",
    sm: "0.8rem",
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
  radius: "6px",
  radiusLg: "10px",

  // ─── Ombres ───
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
    md: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
    lg: "0 4px 6px rgba(0, 0, 0, 0.03), 0 12px 24px rgba(0, 0, 0, 0.06)",
    highlight: "0 0 0 3px rgba(67, 24, 255, 0.12), 0 4px 16px rgba(67, 24, 255, 0.1)",
  },
} as const;

export type Theme = typeof theme;
