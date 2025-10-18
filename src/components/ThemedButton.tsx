import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { useThemeColor } from "./Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ThemedButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ThemedButtonProps) {
  const textColor = useThemeColor(theme.color.text);
  const backgroundColor = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[`size_${size}`],
    };

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: "#667eea",
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: "#a855f7",
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: borderColor,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: "#ef4444",
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = (): string => {
    if (variant === "outline" || variant === "ghost") {
      return textColor;
    }
    return "#FFFFFF";
  };

  const getTextStyles = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`text_${size}`],
      color: getTextColor(),
    };
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[getButtonStyles(), isDisabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={size === "small" ? 18 : size === "large" ? 24 : 20}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  // Size styles - These are accessed dynamically via styles[`size_${size}`]
  // eslint-disable-next-line react-native/no-unused-styles
  size_large: {
    minHeight: 56,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  size_medium: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  size_small: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontWeight: "700",
  },
  // Text size styles - These are accessed dynamically via styles[`text_${size}`]
  // eslint-disable-next-line react-native/no-unused-styles
  text_large: {
    fontSize: 18,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  text_medium: {
    fontSize: 16,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  text_small: {
    fontSize: 14,
  },
});
