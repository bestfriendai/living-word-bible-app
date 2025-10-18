import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { bibleApiService } from "@/services/bibleApiService";
import * as Progress from "react-native-progress";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";

export default function ReadingPlanDay() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const textTertiary = useThemeColor(theme.color.textTertiary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const readingPlan = useBibleStore((state) =>
    state.readingPlans.find((p) => p.id === planId),
  );
  const markReadingComplete = useBibleStore(
    (state) => state.markReadingComplete,
  );
  const preferredTranslation = useBibleStore(
    (state) => state.preferredTranslation,
  );

  const [verseContent, setVerseContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentReading = readingPlan?.readings[readingPlan.currentDay - 1];
  const isCompleted = currentReading?.isCompleted || false;
  const progress =
    readingPlan && readingPlan.duration > 0
      ? readingPlan.currentDay / readingPlan.duration
      : 0;

  useEffect(() => {
    const loadVerseContent = async () => {
      if (!currentReading) return;

      setLoading(true);
      try {
        const content = await bibleApiService.getVerse(
          currentReading.reference,
          preferredTranslation,
        );
        setVerseContent(content);
      } catch (error) {
        console.error("Failed to fetch verse:", error);
        setVerseContent("Unable to load verse content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadVerseContent();
  }, [currentReading, preferredTranslation]);

  const handleMarkComplete = async () => {
    if (!readingPlan || !currentReading) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markReadingComplete(readingPlan.id, currentReading.day);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 1800);
  };

  const handleGoToNextDay = () => {
    if (!readingPlan) return;

    const nextDay = readingPlan.currentDay + 1;
    if (nextDay <= readingPlan.duration) {
      router.replace({
        pathname: "/reading-plan-day",
        params: { planId: readingPlan.id },
      });
    } else {
      router.back();
    }
  };

  if (!readingPlan || !currentReading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ headerShown: true, title: "Reading Plan" }} />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="book-remove-outline"
            size={48}
            color={textTertiary}
          />
          <Text style={[styles.errorText, { color: textSecondary }]}>
            Reading plan not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerTintColor: textColor,
          headerStyle: { backgroundColor },
          headerShadowVisible: false,
        }}
      />

      {/* Celebration Overlay */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <LinearGradient
            colors={[colors.success, colors.success + "cc"]}
            style={styles.celebrationContent}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={60}
              color={colors.white}
            />
            <Text style={styles.celebrationText}>Day Complete!</Text>
            <Text style={styles.celebrationSubtext}>Keep it up</Text>
          </LinearGradient>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.planName, { color: textColor }]}>
              {readingPlan.name}
            </Text>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayText, { color: textSecondary }]}>
                Day {readingPlan.currentDay}
              </Text>
              <View style={styles.dot} />
              <Text style={[styles.dayText, { color: textTertiary }]}>
                {Math.round(progress * 100)}% complete
              </Text>
            </View>
          </View>
          <Progress.Circle
            size={56}
            progress={progress}
            showsText
            formatText={() => `${readingPlan.currentDay}`}
            color={colors.primary}
            unfilledColor={textTertiary + "20"}
            borderWidth={0}
            thickness={5}
            textStyle={{
              fontSize: fontSize.sm,
              color: textColor,
            }}
          />
        </View>

        {/* Progress Bar */}
        <Progress.Bar
          progress={progress}
          width={null}
          height={4}
          color={colors.primary}
          unfilledColor={textTertiary + "15"}
          borderWidth={0}
          borderRadius={2}
          style={styles.progressBar}
        />

        {/* Reading Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.readingTitle, { color: textColor }]}>
            {currentReading.title || currentReading.reference}
          </Text>
          <View style={[styles.referenceChip, { backgroundColor: cardBg }]}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.referenceText}>{currentReading.reference}</Text>
          </View>
        </View>

        {/* Verse Content */}
        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: textSecondary }]}>
                Loading scripture...
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.verseScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.verseContent, { color: textColor }]}>
                {verseContent}
              </Text>
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Implement notes functionality
              console.log("Add note for:", currentReading?.reference);
            }}
          >
            <MaterialCommunityIcons
              name="note-text-outline"
              size={20}
              color={textSecondary}
            />
            <Text style={[styles.actionButtonText, { color: textSecondary }]}>
              Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Implement bookmark functionality
              console.log("Bookmark:", currentReading?.reference);
            }}
          >
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={20}
              color={textSecondary}
            />
            <Text style={[styles.actionButtonText, { color: textSecondary }]}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Implement share functionality
              console.log("Share:", currentReading?.reference);
            }}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={20}
              color={textSecondary}
            />
            <Text style={[styles.actionButtonText, { color: textSecondary }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Overview */}
        <View style={[styles.progressOverview, { backgroundColor: cardBg }]}>
          <Text style={[styles.progressTitle, { color: textColor }]}>
            Reading Progress
          </Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={[styles.progressStatValue, { color: textColor }]}>
                {readingPlan.readings.filter((r) => r.isCompleted).length}
              </Text>
              <Text
                style={[styles.progressStatLabel, { color: textSecondary }]}
              >
                Days Completed
              </Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={[styles.progressStatValue, { color: textColor }]}>
                {readingPlan.duration - readingPlan.currentDay + 1}
              </Text>
              <Text
                style={[styles.progressStatLabel, { color: textSecondary }]}
              >
                Days Remaining
              </Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={[styles.progressStatValue, { color: textColor }]}>
                {Math.round(
                  (readingPlan.readings.filter((r) => r.isCompleted).length /
                    readingPlan.duration) *
                    100,
                )}
                %
              </Text>
              <Text
                style={[styles.progressStatLabel, { color: textSecondary }]}
              >
                Complete
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: cardBg,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {!isCompleted ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButtonGradient}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color={colors.white}
              />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedContainer}>
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color="#10b981"
              />
              <Text style={styles.completedText}>Completed</Text>
            </View>
            {readingPlan.currentDay < readingPlan.duration && (
              <TouchableOpacity
                style={styles.nextDayButton}
                onPress={handleGoToNextDay}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextDayGradient}
                >
                  <Text style={styles.nextDayText}>Next Day</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bottomBar: {
    borderTopColor: colors.black + "0d",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.md,
    position: "absolute",
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  celebrationContent: {
    alignItems: "center",
    borderRadius: 100,
    gap: spacing.md,
    height: 200,
    justifyContent: "center",
    width: 200,
  },
  celebrationOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  celebrationSubtext: {
    color: colors.white + "e6",
    fontSize: fontSize.md,
  },
  celebrationText: {
    color: "#FFFFFF",
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  centerContent: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  completeButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  completeButtonGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  completedBadge: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  completedContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  completedText: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  container: {
    flex: 1,
  },
  contentCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    minHeight: 300,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dayInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dayText: {
    fontSize: fontSize.sm,
  },
  dot: {
    backgroundColor: colors.text.tertiary,
    borderRadius: 1.5,
    height: 3,
    width: 3,
  },
  errorText: {
    fontSize: fontSize.sm,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.sm,
  },
  nextDayButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  nextDayGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  nextDayText: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  planName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
    marginBottom: spacing.xs,
  },
  progressBar: {
    marginBottom: spacing.xl,
  },
  progressDivider: {
    backgroundColor: colors.border.light,
    height: "70%",
    marginHorizontal: spacing.md,
    width: 1,
  },
  progressInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  progressOverview: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  progressSection: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  progressStat: {
    alignItems: "center",
    flex: 1,
  },
  progressStatLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
  progressStatValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  progressStats: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.2,
    marginBottom: spacing.md,
  },
  readingTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: spacing.md,
  },
  referenceChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  referenceText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  verseContent: {
    fontSize: fontSize.md,
    letterSpacing: 0.2,
    lineHeight: 26,
  },
  verseScrollView: {
    maxHeight: 400,
  },
});
