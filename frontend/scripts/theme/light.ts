// Theme Light
// Adaptation du dsfr pour le dashboard

// ─── Palette de base ───
const palette = {
  // DSFR Core
  primary: "var(--background-active-blue-france)",
  primaryHover: "#292aa4",
  primaryBg: "#e8ecfe",
  primaryBorder: "#c5c5f7",

  // Interactions
  accent: "#0000d6",
  accentBg: "#e8edff",

  // Neutres
  white: "#ffffff",
  grey100: "#f9fafb",
  grey200: "#f6f6f6",
  grey300: "#eeeeee",
  grey400: "#dddddd",
  grey600: "#666666",
  grey800: "#3a3a3a",
  purple: "#4318FF",

  // Sémantiques
  success: "#059669",
  successHover: "#047857",
  successBg: "#ecfdf5",
  successBorder: "#bce3d5",

  warning: "#b34000",
  warningHover: "#9a3700",
  warningBg: "#fff4f3",
  warningBorder: "#f5d0c5",

  error: "#dc2626",
  errorHover: "#b91c1c",
  errorBg: "#fef2f2",
  errorBorder: "#f0d4d4",

  // Autres
  yellow: "#fbbf24",
} as const;

export const theme = {
  // ─── Couleurs sémantiques ───
  colors: {
    // Primary
    primary: palette.primary,
    primaryHover: palette.primaryHover,
    primaryBg: palette.primaryBg,
    primaryBorder: palette.primaryBorder,

    // Accent
    accent: palette.accent,
    accentBg: palette.accentBg,
    purple: palette.purple,
    purpleBg: "#f3f0ff",
    purpleBorder: "#d8ccff",

    // Texte
    text: "var(--text-title-grey)",
    textLight: "var(--text-mention-grey)",
    textMuted: palette.grey600,

    // Fonds
    background: palette.white,
    backgroundAlt: palette.grey200,
    backgroundSubtle: palette.grey100,
    backgroundMuted: palette.grey300,
    backgroundMutedHover: palette.grey400,

    // Bordures
    border: palette.grey400,

    // Success
    success: palette.success,
    successHover: palette.successHover,
    successBg: palette.successBg,
    successBorder: palette.successBorder,

    // Warning
    warning: palette.warning,
    warningHover: palette.warningHover,
    warningBg: palette.warningBg,
    warningBorder: palette.warningBorder,

    // Error
    error: palette.error,
    errorHover: palette.errorHover,
    errorBg: palette.errorBg,
    errorBorder: palette.errorBorder,

    // Autres
    star: palette.yellow,
  },

  // ─── Boutons ───
  button: {
    primary: {
      background: palette.primary,
      backgroundHover: palette.primaryHover,
      color: palette.white,
    },
    secondary: {
      backgroundHover: palette.grey100,
      border: palette.grey300,
      borderHover: palette.grey400,
    },
    tertiary: {
      background: "transparent",
      backgroundHover: palette.grey200,
      color: palette.primary,
    },
  },

  // ─── Liens ───
  link: {
    color: palette.primary,
  },

  // ─── Typographie ───
  fontSize: {
    xs: "0.75rem",
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
    default: "6px",
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
