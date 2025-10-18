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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
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
            <View>
              <Text style={[styles.date, { color: textColor }]}>
                {dateString}
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Devotional
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => fetchVerseOfTheDay()}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={32}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {verseOfTheDay ? (
          <>
            {/* Title Card */}
            <View style={styles.titleCard}>
              <Text style={[styles.devotionalTitle, { color: textColor }]}>
                {verseOfTheDay.title}
              </Text>
            </View>

            {/* Verse Card */}
            <View style={styles.verseCard}>
              <View style={styles.verseGradient}>
                <Text style={styles.verseReference}>
                  {verseOfTheDay.reference}
                </Text>
                <Text style={styles.verseText}>
                  &quot;{verseOfTheDay.text}&quot;
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
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
            </View>

            {/* Reflection Section */}
            <View style={styles.reflectionSection}>
              <Text style={[styles.reflectionTitle, { color: textColor }]}>
                Reflection
              </Text>
              <Text
                style={[styles.reflectionText, { color: textColor + "E0" }]}
              >
                {verseOfTheDay.reflection}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.loadingState}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={64}
              color={textColor + "30"}
            />
            <Text style={[styles.loadingText, { color: textColor + "70" }]}>
              Loading today&apos;s devotional...
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
  },
  header: {
    marginBottom: appleDesign.spacing.xxl,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginTop: appleDesign.spacing.md,
  },
  reflectionSection: {
    marginBottom: appleDesign.spacing.xxl,
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
    marginBottom: appleDesign.spacing.lg,
  },
  refreshButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: appleDesign.button.height.medium,
    minWidth: appleDesign.button.height.medium,
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
  title: {
    fontSize: appleDesign.typography.fontSize.largeTitle,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.largeTitle,
  },
  titleCard: {
    marginBottom: appleDesign.spacing.xl,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verseCard: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xl,
    overflow: "hidden",
    ...appleDesign.shadows.md,
  },
  verseGradient: {
    backgroundColor: COLOR_ORANGE,
    justifyContent: "center",
    minHeight: 200,
    padding: appleDesign.spacing.xxl,
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
    fontSize: appleDesign.typography.fontSize.title3,
    fontStyle: "italic",
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: 30,
  },
});
