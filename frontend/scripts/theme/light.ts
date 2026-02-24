// Theme Light
// Adaptation du dsfr pour le dashboard

// ─── Palette de base ───
const palette = {
  // DSFR Core
  primary: "#000091",
  primaryBg: "#e3e3fd",
  primaryBorder: "#c5c5f7",
  primaryDark: "#2a2a8a",

  // Interactions
  hover: "#1212FF",
  accent: "#4318FF",
  accentBg: "#e8edff",

  // Neutres
  white: "#ffffff",
  grey100: "#f9fafb",
  grey200: "#f6f6f6",
  grey300: "#eeeeee",
  grey400: "#ebebec",
  grey600: "#666666",
  grey800: "#3a3a3a",

  // Sémantiques
  success: "#059669",
  successBg: "#ecfdf5",
  successBorder: "#bce3d5",

  warning: "#b34000",
  warningBg: "#fff4f3",
  warningBorder: "#f5d0c5",

  error: "#dc2626",
  errorBg: "#fef2f2",
  errorBorder: "#f0d4d4",

  // Autres
  yellow: "#fbbf24",
} as const;

export const theme = {
  // ─── Couleurs sémantiques ───
  colors: {
    primary: palette.primary,
    primaryBg: palette.primaryBg,
    primaryBorder: palette.primaryBorder,
    primaryDark: palette.primaryDark,

    accentBg: palette.accentBg,
    hover: palette.hover,

    text: "var(--text-title-grey)",
    textLight: "var(--text-mention-grey)",
    textMuted: palette.grey600,

    background: palette.white,
    backgroundAlt: palette.grey200,
    backgroundSubtle: palette.grey100,

    border: palette.grey400,

    success: palette.success,
    successBg: palette.successBg,
    successBorder: palette.successBorder,

    warning: palette.warning,
    warningBg: palette.warningBg,
    warningBorder: palette.warningBorder,

    error: palette.error,
    errorBg: palette.errorBg,
    errorBorder: palette.errorBorder,

    star: palette.yellow,
  },

  // ─── Boutons ───
  button: {
    primary: {
      background: palette.primary,
      color: palette.white,
    },
    secondary: {
      background: palette.primaryBg,
      color: palette.primary,
    },
    link: {
      background: "transparent",
      color: palette.primary,
    },
    outline: {
      background: "transparent",
      color: palette.primary,
      border: palette.primary,
    },
  },

  // ─── Badges ───
  badge: {
    neutral: {
      background: palette.grey300,
      color: palette.grey800,
    },
    active: {
      background: palette.primaryBg,
      color: palette.primary,
    },
    highlight: {
      background: palette.primaryBg,
      color: palette.accent,
    },
  },

  // ─── Liens ───
  link: {
    color: palette.primary,
  },

  // ─── Typographie ───
  fontSize: {
    xs: "0.7rem",
    sm: "0.82rem",
    md: "0.92rem",
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
    default: "7px",
    tag: "100px",
    round: "50%",
  },

  // ─── Ombres ───
  shadow: {
    md: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
    lg: "0 4px 6px rgba(0, 0, 0, 0.03), 0 12px 24px rgba(0, 0, 0, 0.06)",
  },
} as const;

export type Theme = typeof theme;
