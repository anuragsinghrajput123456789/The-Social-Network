// Social Network Centralized Design System Tokens

export const designTokens = {
  brand: {
    name: "Social Network",
    tagline: "Connect, Share & Build Communities",
    primary: "#6A5AE0", // Bond Violet
    primaryHover: "#5848c9",
    secondary: "#3B82F6", // Cyber Sky
    secondaryHover: "#2563eb",
    accent: "#ec4899", // Neon Pink
    accentHover: "#db2777",
  },
  colors: {
    dark: {
      bg: "#10121b",
      surface: "#151826",
      surfaceHover: "#1f2236",
      border: "rgba(113, 119, 144, 0.25)",
      text: "#f9fafb",
      textSecondary: "#8f9394",
      glass: "rgba(21, 24, 38, 0.75)",
      glow: "rgba(106, 90, 224, 0.35)"
    },
    light: {
      bg: "#f8fafc",
      surface: "#ffffff",
      surfaceHover: "#f1f5f9",
      border: "#e2e8f0",
      text: "#0f172a",
      textSecondary: "#64748b",
      glass: "rgba(255, 255, 255, 0.8)",
      glow: "rgba(106, 90, 224, 0.15)"
    }
  },
  radius: {
    sm: "0.5rem",   // 8px
    md: "0.75rem",  // 12px
    lg: "1rem",     // 16px
    xl: "1.5rem",   // 24px
    full: "9999px"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    glow: "0 0 20px rgba(106, 90, 224, 0.35)",
    cyanGlow: "0 0 20px rgba(59, 130, 246, 0.35)"
  },
  motion: {
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    durationFast: "0.15s",
    durationNormal: "0.3s",
    durationSlow: "0.5s"
  }
};
