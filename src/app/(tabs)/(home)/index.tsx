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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MotiView } from "moti";
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
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: textTertiary }]}>
                Good {timeOfDay}
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Living Word
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
        </MotiView>

        {/* Today's Verse - Featured Card */}
        {isLoadingVerse ? (
          <FeaturedVerseSkeleton />
        ) : verseOfTheDay ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 15, delay: 150 }}
          >
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
                    <Text style={styles.featuredBadgeText}>TODAY</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.text.inverseLight}
                  />
                </View>
                <Text style={styles.featuredVerse} numberOfLines={3}>
                  {verseOfTheDay.text}
                </Text>
                <Text style={styles.featuredReference}>
                  {verseOfTheDay.reference}
                </Text>
              </LinearGradient>
            </Pressable>
          </MotiView>
        ) : null}

        {/* Quick Access - Bento Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Access
          </Text>

          <View style={styles.bentoGrid}>
            {/* Scripture - Wide Card (2x1) */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 18, delay: 250 }}
              style={styles.bentoWide}
            >
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
                  <View style={[styles.bentoIcon, styles.bentoIconBlue]}>
                    <MaterialCommunityIcons
                      name="book-search"
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.bentoTitle, { color: textColor }]}>
                    Scripture Search
                  </Text>
                  <Text
                    style={[styles.bentoSubtitle, { color: textSecondary }]}
                  >
                    Find verses for any situation
                  </Text>
                </LinearGradient>
              </Pressable>
            </MotiView>

            {/* Row 2 - Three small cards */}
            <View style={styles.bentoRow}>
              {/* Reading Plans */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18, delay: 300 }}
                style={styles.bentoSmall}
              >
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
                  <View style={[styles.bentoIconSmall, styles.bentoIconGreen]}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={24}
                      color={colors.success}
                    />
                  </View>
                  <Text style={[styles.bentoTitleSmall, { color: textColor }]}>
                    Plans
                  </Text>
                </Pressable>
              </MotiView>

              {/* Prayer Journal */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18, delay: 350 }}
                style={styles.bentoSmall}
              >
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
                  <View
                    style={[styles.bentoIconSmall, styles.bentoIconPurpleAlt]}
                  >
                    <MaterialCommunityIcons
                      name="hand-heart"
                      size={24}
                      color={colors.secondary}
                    />
                  </View>
                  <Text style={[styles.bentoTitleSmall, { color: textColor }]}>
                    Prayer
                  </Text>
                </Pressable>
              </MotiView>

              {/* Memorization */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 18, delay: 400 }}
                style={styles.bentoSmall}
              >
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
                  <View style={[styles.bentoIconSmall, styles.bentoIconViolet]}>
                    <MaterialCommunityIcons
                      name="brain"
                      size={24}
                      color={colors.secondary}
                    />
                  </View>
                  <Text style={[styles.bentoTitleSmall, { color: textColor }]}>
                    Memory
                  </Text>
                </Pressable>
              </MotiView>
            </View>
          </View>
        </View>

        {/* Featured Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            AI Tools
          </Text>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20, delay: 450 }}
          >
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
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={textTertiary}
              />
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20, delay: 500 }}
          >
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
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={textTertiary}
              />
            </TouchableOpacity>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bentoCard: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bentoCardGradient: {
    borderRadius: 20,
    gap: 8,
    padding: 20,
  },
  bentoCardSmall: {
    minHeight: 120,
    padding: 16,
  },
  bentoCardWide: {
    minHeight: 140,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    marginBottom: 4,
    width: 56,
  },
  bentoIconBlue: {
    backgroundColor: colors.primaryLight,
  },
  bentoIconGreen: {
    backgroundColor: colors.successLight,
  },
  bentoIconPurpleAlt: {
    backgroundColor: colors.secondaryLight,
  },
  bentoIconSmall: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    marginBottom: 8,
    width: 48,
  },
  bentoIconViolet: {
    backgroundColor: colors.secondaryLight,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
  },
  bentoSmall: {
    flex: 1,
  },
  bentoSubtitle: {
    fontFamily: "Montserrat-Medium",
    fontSize: 15,
    opacity: 0.8,
  },
  bentoTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bentoTitleSmall: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  bentoWide: {
    width: "100%",
  },
  container: {
    flex: 1,
  },
  featureCard: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  featureCardLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  featureCardSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    lineHeight: 20,
  },
  featureCardText: {
    flex: 1,
  },
  featureCardTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  featureIconOrange: {
    backgroundColor: colors.warningLightBg,
  },
  featureIconPink: {
    backgroundColor: colors.accentPinkBg,
  },
  featuredBadge: {
    alignItems: "center",
    backgroundColor: colors.background.overlay,
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    color: colors.text.inverse,
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  featuredCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  featuredGradient: {
    minHeight: 140,
    padding: 20,
  },
  featuredHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  featuredReference: {
    color: colors.text.inverseLight,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
  },
  featuredVerse: {
    color: colors.text.inverse,
    fontFamily: "Montserrat-Medium",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 10,
  },
  greeting: {
    fontFamily: "Montserrat-Medium",
    fontSize: 15,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  header: {
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  headerContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center" as const,
    borderRadius: 22,
    height: 44,
    justifyContent: "center" as const,
    width: 44,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pressedBento: {
    opacity: 0.85,
  },
  pressedFeatured: {
    opacity: 0.9,
  },
  pressedOpacity: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 19,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
});
