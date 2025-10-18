/**
 * Centralized color constants for the Living Word app
 * Eliminates hardcoded color literals throughout the codebase
 */

export const colors = {
  // Primary colors - Modern 2025 deep blue/purple spectrum
  primary: "#4F46E5", // Deep indigo
  primaryLight: "#6366F1", // Lighter indigo
  primaryDark: "#4338CA", // Darker indigo
  primaryGlow: "rgba(79, 70, 229, 0.15)",

  secondary: "#8B5CF6", // Vibrant purple
  secondaryLight: "#A78BFA", // Light purple
  secondaryLight80: "rgba(139, 92, 246, 0.8)",
  secondaryDark: "#7C3AED", // Deep purple
  secondaryGlow: "rgba(139, 92, 246, 0.2)",

  purple: "#9333EA", // Rich purple
  purpleLight: "#A855F7", // Light purple variant
  purpleGlow: "rgba(147, 51, 234, 0.2)",

  // Semantic colors - Enhanced 2025 palette
  success: "#10B981", // Emerald green
  successLight: "#34D399",
  successGlow: "rgba(16, 185, 129, 0.15)",

  warning: "#F59E0B", // Amber
  warningLight: "#FBBF24",
  warningLightBg: "rgba(245, 158, 11, 0.12)",

  error: "#EF4444", // Red
  errorLight: "#F87171",
  errorGlow: "rgba(239, 68, 68, 0.15)",

  // Accent colors - Sophisticated 2025 accents
  accent: "#6366F1", // Modern indigo
  accentCyan: "#06B6D4", // Cyan for contrast
  accentPink: "#EC4899", // Hot pink
  accentPinkBg: "rgba(236, 72, 153, 0.12)",
  accentTeal: "#14B8A6", // Modern teal
  accentTealGlow: "rgba(20, 184, 166, 0.15)",

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

  // Dark mode colors - Comprehensive palette
  dark: {
    // Backgrounds
    background: "#000000", // Pure black background
    backgroundSecondary: "#0a0a0a", // Near black for subtle differentiation
    backgroundTertiary: "#141414", // Slightly lighter for layered UI

    // Cards and surfaces
    card: "#1a1a1a", // Standard card background
    cardElevated: "#262626", // Elevated/focused cards
    cardHover: "#2a2a2a", // Hover state

    // Borders
    border: "#333333", // Default border
    borderLight: "#262626", // Subtle borders
    borderDark: "#404040", // Prominent borders

    // Text
    text: "#FFFFFF", // Primary text
    textSecondary: "#A0A0A0", // Secondary text
    textTertiary: "#707070", // Tertiary/disabled text
    textInverse: "#000000", // Text on light backgrounds (buttons)

    // Inputs
    inputBackground: "#1a1a1a", // Input field backgrounds
    inputBorder: "#333333", // Input borders
    inputBorderFocused: "#667eea", // Focused input border
    inputPlaceholder: "#666666", // Placeholder text

    // Overlays
    overlay: "rgba(0, 0, 0, 0.8)", // Modal overlays
    scrim: "rgba(0, 0, 0, 0.5)", // Background scrims

    // Special
    divider: "#262626", // Divider lines
    shadow: "rgba(0, 0, 0, 0.9)", // Shadow color (darker for depth)
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
