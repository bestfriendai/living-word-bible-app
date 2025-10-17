import * as Device from "expo-device";

const SPACE_SCALE = 1.33;
const FONT_SCALE = 1.2;

const isIpad = Device.osName === "iPadOS";
export const spaceScale = (value: number) =>
  isIpad ? Math.round(value * SPACE_SCALE) : value;
const fontScale = (size: number) =>
  isIpad ? Math.round(size * FONT_SCALE) : size;

export const theme = {
  colorRed: "#FF0000",
  colorWhite: "#FFFFFF",
  colorBlack: "#000000",
  colorLightGreen: "#9BDFB1",
  colorDarkGreen: "#1AC9A2",
  colorGrey: "#ADB5BD",

  color: {
    reactBlue: {
      light: "#087EA4",
      dark: "#58C4DC",
    },
    transparent: {
      light: "rgba(255,255,255,0)",
      dark: "rgba(0,0,0,0)",
    },
    text: { light: "#1a1a1a", dark: "#F5F5F5" },
    textSecondary: { light: "#6b7280", dark: "#9ca3af" },
    textTertiary: { light: "#9ca3af", dark: "#6b7280" },
    background: { light: "#FAFAFA", dark: "#0a0a0a" },
    backgroundSecondary: {
      light: "#FFFFFF",
      dark: "#1a1a1a",
    },
    backgroundTertiary: {
      light: "#F5F5F5",
      dark: "#141414",
    },
    backgroundElement: {
      light: "#F8F9FA",
      dark: "#141414",
    },
    border: { light: "#E5E7EB", dark: "#374151" },
    borderLight: { light: "#F3F4F6", dark: "#1F2937" },

    // Brand colors
    primary: { light: "#667eea", dark: "#818cf8" },
    primaryLight: { light: "#8B5CF6", dark: "#A78BFA" },
    success: { light: "#10b981", dark: "#34d399" },
    warning: { light: "#f59e0b", dark: "#fbbf24" },
    danger: { light: "#ef4444", dark: "#f87171" },
    info: { light: "#3b82f6", dark: "#60a5fa" },

    // Extended color palette
    purple: "#a855f7",
    purpleLight: "#a855f720",
    purpleDark: "#9333ea",
    blue: "#3b82f6",
    blueLight: "#3b82f620",
    green: "#10b981",
    greenLight: "#10b98120",
    orange: "#fb923c",
    orangeLight: "rgba(251, 146, 60, 0.1)",
    pink: "#ec4899",
    pinkLight: "rgba(236, 72, 153, 0.1)",
    violet: "#8b5cf6",
    violetLight: "#8b5cf620",
    gray: "#9ca3af",
    white: "#FFFFFF",
    whiteTransparent: "rgba(255, 255, 255, 0.2)",
    whiteTransparent85: "rgba(255, 255, 255, 0.85)",
  },

  darkActiveContent: "rgba(255,255,255, 0.3)",

  lightActiveContent: "rgba(0,0,0, 0.1)",

  space2: spaceScale(2),
  space4: spaceScale(4),
  space8: spaceScale(8),
  space12: spaceScale(12),
  space16: spaceScale(16),
  space24: spaceScale(24),

  fontSize10: fontScale(10),
  fontSize11: fontScale(11),
  fontSize12: fontScale(12),
  fontSize13: fontScale(13),
  fontSize14: fontScale(14),
  fontSize15: fontScale(15),
  fontSize16: fontScale(16),
  fontSize17: fontScale(17),
  fontSize18: fontScale(18),
  fontSize20: fontScale(20),
  fontSize22: fontScale(22),
  fontSize24: fontScale(24),
  fontSize26: fontScale(26),
  fontSize28: fontScale(28),
  fontSize32: fontScale(32),
  fontSize34: fontScale(34),
  fontSize42: fontScale(42),

  fontFamilyLight: "Montserrat-Light",
  fontFamilyLightItalic: "Montserrat-LightItalic",

  fontFamily: "Montserrat-Medium",
  fontFamilyItalic: "Montserrat-MediumItalic",

  fontFamilySemiBold: "Montserrat-SemiBold",
  fontFamilySemiBoldItalic: "Montserrat-SemiBoldItalic",

  fontFamilyBold: "Montserrat-Bold",
  fontFamilyBoldItalic: "Montserrat-BoldItalic",

  borderRadius4: 4,
  borderRadius6: 6,
  borderRadius10: 10,
  borderRadius12: 12,
  borderRadius20: 20,
  borderRadius32: 32,
  borderRadius34: 34,
  borderRadius40: 40,
  borderRadius45: 45,
  borderRadius80: 80,

  dropShadow: {
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },
};
