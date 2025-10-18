import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { colors } from "@/theme/colors";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { hapticPatterns } from "@/utils/haptics";
import { FeaturedVerseSkeleton } from "@/components/SkeletonLoader";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const textTertiary = useThemeColor(theme.color.textTertiary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);

  const verseOfTheDay = useBibleStore((state) => state.verseOfTheDay);
  const fetchVerseOfTheDay = useBibleStore((state) => state.fetchVerseOfTheDay);

  useEffect(() => {
    const loadVerse = async () => {
      setIsLoadingVerse(true);
      await fetchVerseOfTheDay();
      setIsLoadingVerse(false);
    };
    loadVerse();
  }, [fetchVerseOfTheDay]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVerseOfTheDay();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const currentDate = new Date();
  const timeOfDay =
    currentDate.getHours() < 12
      ? "Morning"
      : currentDate.getHours() < 18
        ? "Afternoon"
        : "Evening";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textSecondary}
            colors={[theme.color.reactBlue.dark]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextSection}>
              <Text style={[styles.greeting, { color: textTertiary }]}>
                Good {timeOfDay}
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Living Word
              </Text>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                Your daily spiritual companion
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <Pressable
                onPress={async () => {
                  await hapticPatterns.buttonPress();
                  router.push("/settings");
                }}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: cardBg },
                  pressed && styles.pressedOpacity,
                ]}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color={textColor}
                />
              </Pressable>
              <Pressable
                onPress={async () => {
                  await hapticPatterns.buttonPress();
                  router.push("/profile");
                }}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: cardBg },
                  pressed && styles.pressedOpacity,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={24}
                  color={textColor}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Today's Verse - Featured Card */}
        {isLoadingVerse ? (
          <FeaturedVerseSkeleton />
        ) : verseOfTheDay ? (
          <Pressable
            onPress={() => {
              hapticPatterns.buttonPress();
              router.push("/devotional");
            }}
            style={({ pressed }) => [
              styles.featuredCard,
              pressed && styles.pressedFeatured,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredHeader}>
                <View style={styles.featuredBadge}>
                  <MaterialCommunityIcons
                    name="star-four-points"
                    size={12}
                    color={colors.text.inverse}
                  />
                  <Text style={styles.featuredBadgeText}>VERSE OF THE DAY</Text>
                </View>
                <View style={styles.featuredActions}>
                  <MaterialCommunityIcons
                    name="bookmark-outline"
                    size={20}
                    color={colors.text.inverseLight}
                    style={styles.featuredActionIcon}
                  />
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={20}
                    color={colors.text.inverseLight}
                    style={styles.featuredActionIcon}
                  />
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.text.inverseLight}
                  />
                </View>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredVerse} numberOfLines={3}>
                  {verseOfTheDay.text}
                </Text>
                <Text style={styles.featuredReference}>
                  {verseOfTheDay.reference}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : null}

        {/* Quick Access - Enhanced Bento Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Quick Access
            </Text>
            <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
              Jump to your favorite features
            </Text>
          </View>

          <View style={styles.bentoGrid}>
            {/* Scripture - Wide Card (2x1) */}
            <View style={styles.bentoWide}>
              <Pressable
                onPress={() => {
                  hapticPatterns.buttonPress();
                  router.push("/scripture");
                }}
                style={({ pressed }) => [
                  styles.bentoCard,
                  styles.bentoCardWide,
                  { backgroundColor: cardBg },
                  pressed && styles.pressedBento,
                ]}
              >
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bentoCardGradient}
                >
                  <View style={styles.bentoCardHeader}>
                    <View style={[styles.bentoIcon, styles.bentoIconBlue]}>
                      <MaterialCommunityIcons
                        name="book-search"
                        size={28}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.bentoCardBadge}>
                      <Text style={styles.bentoCardBadgeText}>Popular</Text>
                    </View>
                  </View>
                  <View style={styles.bentoCardContent}>
                    <Text style={[styles.bentoTitle, { color: textColor }]}>
                      Scripture Search
                    </Text>
                    <Text
                      style={[styles.bentoSubtitle, { color: textSecondary }]}
                    >
                      Find verses for any situation
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Row 2 - Three enhanced small cards */}
            <View style={styles.bentoRow}>
              {/* Reading Plans */}
              <View style={styles.bentoSmall}>
                <Pressable
                  onPress={() => {
                    hapticPatterns.buttonPress();
                    router.push("/reading-plans");
                  }}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    styles.bentoCardSmall,
                    { backgroundColor: cardBg },
                    pressed && styles.pressedBento,
                  ]}
                >
                  <View style={styles.bentoSmallContent}>
                    <View
                      style={[styles.bentoIconSmall, styles.bentoIconGreen]}
                    >
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={24}
                        color={colors.success}
                      />
                    </View>
                    <Text
                      style={[styles.bentoTitleSmall, { color: textColor }]}
                    >
                      Plans
                    </Text>
                    <Text
                      style={[
                        styles.bentoSmallSubtitle,
                        { color: textSecondary },
                      ]}
                    >
                      Daily
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Prayer Journal */}
              <View style={styles.bentoSmall}>
                <Pressable
                  onPress={() => {
                    hapticPatterns.buttonPress();
                    router.push("/journal");
                  }}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    styles.bentoCardSmall,
                    { backgroundColor: cardBg },
                    pressed && styles.pressedBento,
                  ]}
                >
                  <View style={styles.bentoSmallContent}>
                    <View
                      style={[styles.bentoIconSmall, styles.bentoIconPurpleAlt]}
                    >
                      <MaterialCommunityIcons
                        name="hand-heart"
                        size={24}
                        color={colors.secondary}
                      />
                    </View>
                    <Text
                      style={[styles.bentoTitleSmall, { color: textColor }]}
                    >
                      Prayer
                    </Text>
                    <Text
                      style={[
                        styles.bentoSmallSubtitle,
                        { color: textSecondary },
                      ]}
                    >
                      Journal
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Memorization */}
              <View style={styles.bentoSmall}>
                <Pressable
                  onPress={() => {
                    hapticPatterns.buttonPress();
                    router.push("/memorization");
                  }}
                  style={({ pressed }) => [
                    styles.bentoCard,
                    styles.bentoCardSmall,
                    { backgroundColor: cardBg },
                    pressed && styles.pressedBento,
                  ]}
                >
                  <View style={styles.bentoSmallContent}>
                    <View
                      style={[styles.bentoIconSmall, styles.bentoIconViolet]}
                    >
                      <MaterialCommunityIcons
                        name="brain"
                        size={24}
                        color={colors.secondary}
                      />
                    </View>
                    <Text
                      style={[styles.bentoTitleSmall, { color: textColor }]}
                    >
                      Memory
                    </Text>
                    <Text
                      style={[
                        styles.bentoSmallSubtitle,
                        { color: textSecondary },
                      ]}
                    >
                      Verses
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Tools - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              AI-Powered Tools
            </Text>
            <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
              Enhanced spiritual guidance
            </Text>
          </View>

          <View style={styles.featureCardsContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.featureCard, { backgroundColor: cardBg }]}
              onPress={() => router.push("/prayer-buddy")}
            >
              <View style={styles.featureCardLeft}>
                <View style={[styles.featureIcon, styles.featureIconPink]}>
                  <MaterialCommunityIcons
                    name="robot-love"
                    size={24}
                    color={colors.accentPink}
                  />
                </View>
                <View style={styles.featureCardText}>
                  <Text style={[styles.featureCardTitle, { color: textColor }]}>
                    Prayer Companion
                  </Text>
                  <Text
                    style={[
                      styles.featureCardSubtitle,
                      { color: textSecondary },
                    ]}
                  >
                    AI-powered spiritual guidance
                  </Text>
                  <View style={styles.featureCardTags}>
                    <View style={styles.featureCardTag}>
                      <Text style={styles.featureCardTagText}>AI</Text>
                    </View>
                    <View style={styles.featureCardTag}>
                      <Text style={styles.featureCardTagText}>Chat</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.featureCardRight}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={textTertiary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.featureCard, { backgroundColor: cardBg }]}
              onPress={() => router.push("/devotional")}
            >
              <View style={styles.featureCardLeft}>
                <View style={[styles.featureIcon, styles.featureIconOrange]}>
                  <MaterialCommunityIcons
                    name="meditation"
                    size={24}
                    color={colors.warning}
                  />
                </View>
                <View style={styles.featureCardText}>
                  <Text style={[styles.featureCardTitle, { color: textColor }]}>
                    Daily Devotional
                  </Text>
                  <Text
                    style={[
                      styles.featureCardSubtitle,
                      { color: textSecondary },
                    ]}
                  >
                    Verse of the day with insights
                  </Text>
                  <View style={styles.featureCardTags}>
                    <View style={styles.featureCardTag}>
                      <Text style={styles.featureCardTagText}>Daily</Text>
                    </View>
                    <View style={styles.featureCardTag}>
                      <Text style={styles.featureCardTagText}>Audio</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.featureCardRight}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={textTertiary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bentoCard: {
    borderRadius: appleDesign.borderRadius.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bentoCardBadge: {
    backgroundColor: colors.primaryGlow,
    borderRadius: appleDesign.borderRadius.sm,
    paddingHorizontal: appleDesign.spacing.sm,
    paddingVertical: appleDesign.spacing.xs,
  },
  bentoCardBadgeText: {
    color: colors.primary,
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.caption1,
  },
  bentoCardContent: {
    flex: 1,
  },
  bentoCardGradient: {
    borderRadius: appleDesign.borderRadius.xl,
    gap: appleDesign.spacing.sm,
    padding: appleDesign.spacing.xl,
  },
  bentoCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.md,
  },
  bentoCardSmall: {
    minHeight: 120,
    padding: appleDesign.spacing.lg,
  },
  bentoCardWide: {
    minHeight: 160,
  },
  bentoGrid: {
    gap: appleDesign.spacing.lg,
  },
  bentoIcon: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.lg,
    height: 56,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.sm,
    width: 56,
  },
  bentoIconBlue: {
    backgroundColor: colors.primaryLight + "20",
  },
  bentoIconGreen: {
    backgroundColor: colors.successLight + "20",
  },
  bentoIconPurpleAlt: {
    backgroundColor: colors.secondaryLight + "20",
  },
  bentoIconSmall: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.md,
    height: 48,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.sm,
    width: 48,
  },
  bentoIconViolet: {
    backgroundColor: colors.secondaryLight + "20",
  },
  bentoRow: {
    flexDirection: "row",
    gap: appleDesign.spacing.lg,
  },
  bentoSmall: {
    flex: 1,
  },
  bentoSmallContent: {
    alignItems: "center",
    flex: 1,
  },
  bentoSmallSubtitle: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.caption1,
    marginTop: appleDesign.spacing.xs,
  },
  bentoSubtitle: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    opacity: appleDesign.opacity.strong,
  },
  bentoTitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.title3,
    marginBottom: appleDesign.spacing.xs,
  },
  bentoTitleSmall: {
    fontSize: appleDesign.typography.fontSize.headline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.headline,
  },
  bentoWide: {
    width: "100%",
  },
  container: {
    flex: 1,
  },
  featureCard: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.lg,
    padding: appleDesign.spacing.xl,
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
  featureCardLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: appleDesign.spacing.lg,
  },
  featureCardRight: {
    alignItems: "center",
  },
  featureCardSubtitle: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.xs,
  },
  featureCardTag: {
    backgroundColor: colors.background.tertiary,
    borderRadius: appleDesign.borderRadius.sm,
    marginRight: appleDesign.spacing.xs,
    paddingHorizontal: appleDesign.spacing.sm,
    paddingVertical: appleDesign.spacing.xs,
  },
  featureCardTagText: {
    color: colors.text.secondary,
    fontSize: appleDesign.typography.fontSize.caption2,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.caption2,
  },
  featureCardTags: {
    flexDirection: "row",
    marginTop: appleDesign.spacing.sm,
  },
  featureCardText: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: appleDesign.typography.fontSize.headline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.headline,
  },
  featureCardsContainer: {
    gap: appleDesign.spacing.lg,
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.lg,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  featureIconOrange: {
    backgroundColor: colors.warningLightBg,
  },
  featureIconPink: {
    backgroundColor: colors.accentPinkBg,
  },
  featuredActionIcon: {
    opacity: 0.8,
  },
  featuredActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
  },
  featuredBadge: {
    alignItems: "center",
    backgroundColor: colors.background.overlay,
    borderRadius: appleDesign.borderRadius.lg,
    flexDirection: "row",
    gap: appleDesign.spacing.xs,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.sm,
  },
  featuredBadgeText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.caption1,
  },
  featuredCard: {
    borderRadius: appleDesign.borderRadius.xxl,
    marginBottom: appleDesign.spacing.xxxl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  featuredContent: {
    flex: 1,
  },
  featuredGradient: {
    minHeight: 180,
    padding: appleDesign.spacing.xxl,
  },
  featuredHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.lg,
  },
  featuredReference: {
    color: colors.text.inverseLight,
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.sm,
  },
  featuredVerse: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.title2,
    marginBottom: appleDesign.spacing.md,
  },
  greeting: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.medium,
    letterSpacing: appleDesign.typography.letterSpacing.normal,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginBottom: appleDesign.spacing.xs,
  },
  header: {
    marginBottom: appleDesign.spacing.xxxl,
  },
  headerButtons: {
    flexDirection: "row" as const,
    gap: appleDesign.spacing.md,
  },
  headerContent: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTextSection: {
    flex: 1,
  },
  iconButton: {
    alignItems: "center" as const,
    borderRadius: appleDesign.borderRadius.round,
    height: appleDesign.button.height.medium,
    justifyContent: "center" as const,
    width: appleDesign.button.height.medium,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressedBento: {
    opacity: appleDesign.opacity.strong,
  },
  pressedFeatured: {
    opacity: 0.9,
  },
  pressedOpacity: {
    opacity: appleDesign.opacity.medium,
  },
  scrollContent: {
    paddingHorizontal: appleDesign.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: appleDesign.spacing.xxxl,
  },
  sectionHeader: {
    marginBottom: appleDesign.spacing.lg,
  },
  sectionSubtitle: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.xs,
  },
  sectionTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  subtitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginTop: appleDesign.spacing.xs,
  },
  title: {
    fontSize: appleDesign.typography.fontSize.largeTitle,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.largeTitle,
  },
});
