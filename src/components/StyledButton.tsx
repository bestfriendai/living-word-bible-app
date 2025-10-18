import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing, fontSize, borderRadius } from "../theme/spacing";

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[`${size}Button`],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyleCombined}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Variants - These are accessed dynamically via styles[variant]
  // eslint-disable-next-line react-native/no-unused-styles
  accent: {
    backgroundColor: colors.accent,
  },
  button: {
    alignItems: "center",
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: colors.border.light,
    opacity: 0.6,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  error: {
    backgroundColor: colors.error,
  },
  // Sizes - These are accessed dynamically via styles[`${size}Button`]
  // eslint-disable-next-line react-native/no-unused-styles
  lgButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  // Text styles - These are accessed dynamically via styles[`${size}Text`]
  // eslint-disable-next-line react-native/no-unused-styles
  lgText: {
    fontSize: fontSize.lg,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  mdButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  mdText: {
    fontSize: fontSize.md,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  primary: {
    backgroundColor: colors.primary,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondary: {
    backgroundColor: colors.secondary,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  smButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  smText: {
    fontSize: fontSize.sm,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  success: {
    backgroundColor: colors.success,
  },
  text: {
    color: colors.white,
    fontWeight: "600",
  },
  // eslint-disable-next-line react-native/no-unused-styles
  warning: {
    backgroundColor: colors.warning,
  },
});
