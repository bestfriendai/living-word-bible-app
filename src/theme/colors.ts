/**
 * Centralized color constants for the Living Word app
 * Eliminates hardcoded color literals throughout the codebase
 */

export const colors = {
  // Primary colors
  primary: "#3b82f6",
  primaryLight: "#3b82f620",
  primaryDark: "#2563eb",

  secondary: "#a855f7",
  secondaryLight: "#a855f720",
  secondaryLight80: "#a855f780",
  secondaryDark: "#9333ea",

  // Semantic colors
  success: "#10b981",
  successLight: "#10b98120",

  warning: "#f59e0b",
  warningLight: "#fb923c",
  warningLightBg: "rgba(251, 146, 60, 0.1)",

  error: "#ef4444",
  errorLight: "#ef444420",

  // Accent colors
  accent: "#667eea",
  accentPink: "#ec4899",
  accentPinkBg: "rgba(236, 72, 153, 0.1)",

  // Text colors
  text: {
    primary: "#000000",
    secondary: "#666666",
    tertiary: "#999999",
    inverse: "#FFFFFF",
    inverseLight: "rgba(255, 255, 255, 0.85)",
    inverseSecondary: "rgba(255, 255, 255, 0.7)",
  },

  // Background colors
  background: {
    default: "#FFFFFF",
    secondary: "#F5F5F5",
    tertiary: "#F0F0F0",
    card: "#FFFFFF",
    overlay: "rgba(255, 255, 255, 0.2)",
    purple: "#8b5cf6",
  },

  // Dark mode colors
  dark: {
    background: "#000000",
    card: "#1a1a1a",
    border: "#333333",
    text: "#FFFFFF",
    textSecondary: "#999999",
  },

  // Border colors
  border: {
    light: "#E0E0E0",
    default: "#CCCCCC",
    dark: "#333333",
  },

  // Special colors
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ColorName = keyof typeof colors;

/**
 * Get color with optional opacity
 * @param color - Color name from colors object
 * @param opacity - Opacity value between 0-1
 * @returns RGBA color string
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
