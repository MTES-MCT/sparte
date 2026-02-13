// Theme Light — Configuration visuelle de l'application

export const theme = {
  // ─── Couleurs de base ───
  colors: {
    primary: "#000091",
    primaryLight: "#e3e3fd",
    accent: "#7c3aed",
    accentLight: "#f3e8ff",

    text: "var(--text-title-grey)",
    textLight: "var(--text-mention-grey)",
    textMuted: "#666",

    background: "#fff",
    backgroundAlt: "#f4f4f4",

    border: "#EBEBEC",

    success: "#18753c",
    successLight: "#d1fae5",
    error: "#ce5436",
    errorLight: "#fee2e2",
  },

  // ─── Cartes ───
  card: {
    background: "#fff",
    shadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    radius: "6px",
  },

  // ─── Boutons ───
  button: {
    primary: {
      background: "#000091",
      color: "#fff",
      backgroundHover: "#000074",
    },
    secondary: {
      background: "#e3e3fd",
      color: "#000091",
      backgroundHover: "#cacafb",
    },
    link: {
      background: "transparent",
      color: "#7c3aed",
      backgroundHover: "transparent",
    },
    outline: {
      background: "transparent",
      color: "#000091",
      border: "#d5d9de",
      backgroundHover: "#f4f4f4",
    },
  },

  // ─── Badges ───
  badge: {
    neutral: {
      background: "#f4f4f4",
      color: "#666",
    },
    active: {
      background: "#f3e8ff",
      color: "#7c3aed",
    },
  },

  // ─── Icônes décoratives ───
  iconBadge: {
    background: "#f3e8ff",
    color: "#7c3aed",
  },

  // ─── Liens ───
  link: {
    color: "#7c3aed",
  },

  // ─── Typographie ───
  fontSize: {
    xs: "0.7rem",
    sm: "0.8rem",
    md: "0.95rem",
    lg: "1.15rem",
    xl: "1.35rem",
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
} as const;

export type Theme = typeof theme;
