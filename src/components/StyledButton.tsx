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
  button: {
    alignItems: "center",
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.error,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  disabled: {
    backgroundColor: colors.border.light,
    opacity: 0.6,
  },
  // Sizes
  smButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mdButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lgButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  // Text styles
  text: {
    color: colors.white,
    fontWeight: "600",
  },
  smText: {
    fontSize: fontSize.sm,
  },
  mdText: {
    fontSize: fontSize.md,
  },
  lgText: {
    fontSize: fontSize.lg,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
});
