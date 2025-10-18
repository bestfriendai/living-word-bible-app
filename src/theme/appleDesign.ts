/**
 * Apple Design System
 * Design tokens following Apple's Human Interface Guidelines
 */

import { Platform } from "react-native";

export const appleDesign = {
  // Typography - SF Pro is the default system font on iOS
  typography: {
    // Use system font for authentic iOS feel - simplified for better compatibility
    fontFamily: {
      regular: undefined, // Use default system font
      medium: undefined,
      semibold: undefined,
      bold: undefined,
    },
    fontSize: {
      largeTitle: 24, // Main page titles
      title1: 20, // Section headers
      title2: 18, // Card titles
      title3: 16, // Smaller headers
      headline: 15, // Important body text
      body: 15, // Regular body text
      callout: 14, // Secondary text
      subheadline: 13, // Tertiary text
      footnote: 12, // Small text
      caption1: 11, // Very small text
      caption2: 10, // Tiny text
    },
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      heavy: "800" as const,
    },
    lineHeight: {
      largeTitle: 30, // 1.25x fontSize
      title1: 26, // 1.3x fontSize
      title2: 24, // 1.33x fontSize
      title3: 22, // 1.375x fontSize
      headline: 20, // 1.33x fontSize
      body: 20, // 1.33x fontSize
      callout: 19, // 1.35x fontSize
      subheadline: 18, // 1.38x fontSize
      footnote: 16, // 1.33x fontSize
      caption1: 14, // 1.27x fontSize
      caption2: 13, // 1.3x fontSize
    },
    letterSpacing: {
      tight: -0.4,
      normal: 0,
      wide: 0.4,
    },
  },

  // Spacing - Compact but comfortable
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    huge: 36,
  },

  // Border Radius - Subtle and refined
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    xxl: 16,
    round: 9999,
  },

  // Shadows - Premium 2025 depth with enhanced shadow layers
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
    sm: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
    md: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
    lg: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
    xl: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 12,
      },
    }),
    // 2025 Premium shadow styles with color tints
    glow: Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
    glowPurple: Platform.select({
      ios: {
        shadowColor: "#a855f7",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  // Opacity - Standard iOS opacity levels
  opacity: {
    invisible: 0,
    subtle: 0.4,
    medium: 0.6,
    strong: 0.8,
    full: 1,
  },

  // Animation - iOS-like smooth animations
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 700,
    },
    easing: {
      // iOS default easing
      standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)",
    },
  },

  // Card styles - iOS-like cards
  card: {
    default: {
      borderRadius: 12,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    elevated: {
      borderRadius: 16,
      padding: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    compact: {
      borderRadius: 10,
      padding: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
  },

  // Button styles - iOS-like buttons
  button: {
    height: {
      small: 36,
      medium: 44, // iOS standard touch target
      large: 50,
    },
    padding: {
      small: { horizontal: 12, vertical: 8 },
      medium: { horizontal: 16, vertical: 12 },
      large: { horizontal: 20, vertical: 14 },
    },
  },
} as const;

// Helper function to get shadow style
export const getShadow = (level: keyof typeof appleDesign.shadows) => {
  return appleDesign.shadows[level] || appleDesign.shadows.sm;
};

// Helper function to create card style
export const getCardStyle = (
  variant: keyof typeof appleDesign.card = "default",
) => {
  return appleDesign.card[variant];
};
