import { Stack } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeMode } from "@/contexts/ThemeContext";
import { hapticPatterns } from "@/utils/haptics";
import { colors } from "@/theme/colors";

export default function Settings() {
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const { themeMode, isDark, setThemeMode, toggleTheme } = useAppTheme();

  const handleThemeModeChange = async (mode: ThemeMode) => {
    await hapticPatterns.buttonPress();
    setThemeMode(mode);
  };

  const handleToggleTheme = async () => {
    await hapticPatterns.buttonPress();
    toggleTheme();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Settings",
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: cardBg,
          },
          headerTintColor: textColor,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Appearance
          </Text>

          {/* Quick Dark Mode Toggle */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name={isDark ? "weather-night" : "weather-sunny"}
                  size={24}
                  color={isDark ? colors.purpleLight : colors.warning}
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: textColor }]}>
                    Dark Mode
                  </Text>
                  <Text
                    style={[styles.settingSubtitle, { color: textSecondary }]}
                  >
                    {isDark ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={themeMode === "dark"}
                onValueChange={handleToggleTheme}
                trackColor={{
                  false: colors.text.secondary,
                  true: colors.purpleLight,
                }}
                thumbColor={
                  Platform.OS === "ios"
                    ? colors.white
                    : colors.background.tertiary
                }
                ios_backgroundColor={colors.dark.border}
              />
            </View>
          </View>

          {/* Theme Mode Options */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text
              style={[
                styles.cardTitle,
                { color: textColor },
                styles.themeSectionTitle,
              ]}
            >
              Theme Preference
            </Text>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "light" && styles.themeOptionSelected,
                { borderColor: borderColor },
              ]}
              onPress={() => handleThemeModeChange("light")}
            >
              <MaterialCommunityIcons
                name="weather-sunny"
                size={28}
                color={colors.warning}
              />
              <View style={styles.themeOptionText}>
                <Text style={[styles.themeOptionTitle, { color: textColor }]}>
                  Light
                </Text>
                <Text
                  style={[styles.themeOptionSubtitle, { color: textSecondary }]}
                >
                  Bright and clear
                </Text>
              </View>
              {themeMode === "light" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "dark" && styles.themeOptionSelected,
                { borderColor: borderColor },
              ]}
              onPress={() => handleThemeModeChange("dark")}
            >
              <MaterialCommunityIcons
                name="weather-night"
                size={28}
                color={colors.purpleLight}
              />
              <View style={styles.themeOptionText}>
                <Text style={[styles.themeOptionTitle, { color: textColor }]}>
                  Dark
                </Text>
                <Text
                  style={[styles.themeOptionSubtitle, { color: textSecondary }]}
                >
                  Easy on the eyes
                </Text>
              </View>
              {themeMode === "dark" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "system" && styles.themeOptionSelected,
                { borderColor: borderColor },
              ]}
              onPress={() => handleThemeModeChange("system")}
            >
              <MaterialCommunityIcons
                name="brightness-auto"
                size={28}
                color={colors.primary}
              />
              <View style={styles.themeOptionText}>
                <Text style={[styles.themeOptionTitle, { color: textColor }]}>
                  System
                </Text>
                <Text
                  style={[styles.themeOptionSubtitle, { color: textSecondary }]}
                >
                  Match device settings
                </Text>
              </View>
              {themeMode === "system" && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>About</Text>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: textColor }]}>
                    App Version
                  </Text>
                  <Text
                    style={[styles.settingSubtitle, { color: textSecondary }]}
                  >
                    1.1.3
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={24}
                  color="#10b981"
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: textColor }]}>
                    Living Word Bible App
                  </Text>
                  <Text
                    style={[styles.settingSubtitle, { color: textSecondary }]}
                  >
                    Your companion for spiritual growth
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    elevation: 2,
    marginBottom: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  themeSectionTitle: {
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  settingLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  themeOption: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  themeOptionSelected: {
    backgroundColor: colors.successGlow,
    borderColor: colors.success,
  },
  themeOptionSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
