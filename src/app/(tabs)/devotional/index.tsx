import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { colors } from "@/theme/colors";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { VerseImageGenerator } from "@/components/VerseImageGenerator";
import { ttsService } from "@/utils/textToSpeech";

// Color constants
const COLOR_ORANGE = "#f97316";
const COLOR_WHITE = "#fff";
const COLOR_RED = "#ef4444";
const COLOR_PURPLE = "#8b5cf6";
const COLOR_BLUE = "#3b82f6";

export default function Devotional() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const verseOfTheDay = useBibleStore((state) => state.verseOfTheDay);
  const fetchVerseOfTheDay = useBibleStore((state) => state.fetchVerseOfTheDay);

  useEffect(() => {
    fetchVerseOfTheDay();
  }, [fetchVerseOfTheDay]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVerseOfTheDay();
    } catch (error) {
      console.error("Error refreshing devotional:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handlePlayPause = async () => {
    if (!verseOfTheDay) return;

    if (isPlaying) {
      await ttsService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await ttsService.speakDevotional(
        verseOfTheDay.title || "Today's Devotional",
        verseOfTheDay.reference,
        verseOfTheDay.text,
        verseOfTheDay.reflection || "",
        {
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        },
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

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
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textSecondary}
            colors={[COLOR_ORANGE]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.headerTextSection}>
              <Text style={[styles.date, { color: textSecondary }]}>
                {dateString}
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Daily Devotional
              </Text>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                Spiritual nourishment for your day
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => fetchVerseOfTheDay()}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowImageGenerator(true)}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {verseOfTheDay ? (
          <>
            {/* Title Card */}
            <View style={[styles.titleCard, { backgroundColor: cardBg }]}>
              <View style={styles.titleCardHeader}>
                <View style={styles.titleCardIcon}>
                  <MaterialCommunityIcons
                    name="meditation"
                    size={24}
                    color={COLOR_ORANGE}
                  />
                </View>
                <Text style={[styles.titleCardLabel, { color: textSecondary }]}>
                  Today&apos;s Focus
                </Text>
              </View>
              <Text style={[styles.devotionalTitle, { color: textColor }]}>
                {verseOfTheDay.title}
              </Text>
            </View>

            {/* Enhanced Verse Card */}
            <View style={styles.verseCard}>
              <LinearGradient
                colors={[COLOR_ORANGE, "#ea580c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.verseGradient}
              >
                <View style={styles.verseHeader}>
                  <View style={styles.verseBadge}>
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={16}
                      color={COLOR_WHITE}
                    />
                    <Text style={styles.verseBadgeText}>SCRIPTURE</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.verseBookmark}
                    onPress={() => {
                      // Add bookmark functionality
                    }}
                  >
                    <MaterialCommunityIcons
                      name="bookmark-outline"
                      size={20}
                      color={COLOR_WHITE}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.verseReference}>
                  {verseOfTheDay.reference}
                </Text>
                <Text style={styles.verseText}>
                  &quot;{verseOfTheDay.text}&quot;
                </Text>
              </LinearGradient>
            </View>

            {/* Enhanced Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Listen Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.audioButton]}
                onPress={handlePlayPause}
              >
                <View
                  style={[
                    styles.actionButtonInner,
                    isPlaying
                      ? styles.audioButtonActive
                      : styles.audioButtonInactive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isPlaying ? "stop" : "volume-high"}
                    size={28}
                    color={COLOR_WHITE}
                  />
                  <Text style={styles.actionButtonText}>
                    {isPlaying ? "Stop" : "Listen"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => setShowImageGenerator(true)}
              >
                <View
                  style={[styles.actionButtonInner, styles.shareButtonInner]}
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={28}
                    color={COLOR_WHITE}
                  />
                  <Text style={styles.actionButtonText}>Share</Text>
                </View>
              </TouchableOpacity>

              {/* Notes Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.notesButton]}
                onPress={() => {
                  // Add notes functionality
                }}
              >
                <View
                  style={[styles.actionButtonInner, styles.notesButtonInner]}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={28}
                    color={COLOR_WHITE}
                  />
                  <Text style={styles.actionButtonText}>Notes</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Enhanced Reflection Section */}
            <View
              style={[styles.reflectionSection, { backgroundColor: cardBg }]}
            >
              <View style={styles.reflectionHeader}>
                <View style={styles.reflectionIcon}>
                  <MaterialCommunityIcons
                    name="lightbulb-on"
                    size={24}
                    color={COLOR_PURPLE}
                  />
                </View>
                <Text style={[styles.reflectionTitle, { color: textColor }]}>
                  Daily Reflection
                </Text>
              </View>
              <Text
                style={[styles.reflectionText, { color: textColor + "D0" }]}
              >
                {verseOfTheDay.reflection}
              </Text>

              {/* Prayer Prompt */}
              <View style={styles.prayerPrompt}>
                <Text
                  style={[styles.prayerPromptText, { color: textSecondary }]}
                >
                  🙏 Take a moment to pray about today&apos;s message...
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingState}>
            <View style={styles.loadingIcon}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={48}
                color={COLOR_ORANGE}
              />
            </View>
            <Text style={[styles.loadingText, { color: textColor + "70" }]}>
              Loading today&apos;s devotional...
            </Text>
            <Text style={[styles.loadingSubtext, { color: textColor + "50" }]}>
              Preparing your spiritual nourishment
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Verse Image Generator Modal */}
      {verseOfTheDay && (
        <VerseImageGenerator
          visible={showImageGenerator}
          reference={verseOfTheDay.reference}
          text={verseOfTheDay.text}
          onClose={() => setShowImageGenerator(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: appleDesign.borderRadius.lg,
    flex: 1,
    overflow: "hidden",
    ...appleDesign.shadows.sm,
  },
  actionButtonInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "center",
    paddingVertical: appleDesign.spacing.lg,
  },
  actionButtonText: {
    color: COLOR_WHITE,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  actionButtons: {
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    marginBottom: appleDesign.spacing.xxl,
  },
  audioButton: {},
  audioButtonActive: {
    backgroundColor: COLOR_RED,
  },
  audioButtonInactive: {
    backgroundColor: COLOR_PURPLE,
  },
  container: {
    flex: 1,
  },
  date: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.xs,
  },
  devotionalTitle: {
    fontSize: appleDesign.typography.fontSize.title1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title1,
    marginTop: appleDesign.spacing.sm,
  },
  header: {
    marginBottom: appleDesign.spacing.xxl,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: appleDesign.borderRadius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...appleDesign.shadows.sm,
  },
  headerTextSection: {
    flex: 1,
  },
  loadingIcon: {
    alignItems: "center",
    backgroundColor: COLOR_ORANGE + "20",
    borderRadius: appleDesign.borderRadius.round,
    height: 96,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.xl,
    width: 96,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingSubtext: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.sm,
    textAlign: "center",
  },
  loadingText: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginTop: appleDesign.spacing.md,
  },
  notesButton: {},
  notesButtonInner: {
    backgroundColor: COLOR_BLUE,
  },
  prayerPrompt: {
    backgroundColor: colors.background.tertiary,
    borderRadius: appleDesign.borderRadius.lg,
    marginTop: appleDesign.spacing.xl,
    padding: appleDesign.spacing.lg,
  },
  prayerPromptText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontStyle: "italic",
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  reflectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    marginBottom: appleDesign.spacing.lg,
  },
  reflectionIcon: {
    alignItems: "center",
    backgroundColor: COLOR_PURPLE + "20",
    borderRadius: appleDesign.borderRadius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  reflectionSection: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.xl,
    ...appleDesign.shadows.sm,
  },
  reflectionText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: appleDesign.typography.fontSize.callout,
    letterSpacing: appleDesign.typography.letterSpacing.normal,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  reflectionTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  scrollContent: {
    paddingHorizontal: appleDesign.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  shareButton: {},
  shareButtonInner: {
    backgroundColor: COLOR_BLUE,
  },
  subtitle: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.xs,
  },
  title: {
    fontSize: appleDesign.typography.fontSize.largeTitle,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.largeTitle,
  },
  titleCard: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xl,
    padding: appleDesign.spacing.xl,
    ...appleDesign.shadows.sm,
  },
  titleCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    marginBottom: appleDesign.spacing.sm,
  },
  titleCardIcon: {
    alignItems: "center",
    backgroundColor: COLOR_ORANGE + "20",
    borderRadius: appleDesign.borderRadius.sm,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  titleCardLabel: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.caption1,
    textTransform: "uppercase",
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verseBadge: {
    alignItems: "center",
    backgroundColor: colors.background.overlay,
    borderRadius: appleDesign.borderRadius.md,
    flexDirection: "row",
    gap: appleDesign.spacing.xs,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.xs,
  },
  verseBadgeText: {
    color: COLOR_WHITE,
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.caption1,
  },
  verseBookmark: {
    alignItems: "center",
    backgroundColor: colors.background.overlay,
    borderRadius: appleDesign.borderRadius.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  verseCard: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xl,
    overflow: "hidden",
    ...appleDesign.shadows.lg,
  },
  verseGradient: {
    justifyContent: "center",
    minHeight: 220,
    padding: appleDesign.spacing.xl,
  },
  verseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.lg,
  },
  verseReference: {
    color: COLOR_WHITE,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.lg,
    textTransform: "uppercase",
  },
  verseText: {
    color: COLOR_WHITE,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: appleDesign.typography.fontSize.title2,
    fontStyle: "italic",
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: 32,
  },
});
