import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from "react-native";
import { useThemeColor } from "./Themed";
import { theme } from "@/theme";

interface ThemedCardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
}

export function ThemedCard({
  children,
  style,
  elevated = false,
  noPadding = false,
}: ThemedCardProps) {
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.borderLight);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor },
        elevated && styles.elevated,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  noPadding: {
    padding: 0,
  },
});
