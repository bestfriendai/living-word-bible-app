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
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { bibleApiService } from "@/services/bibleApiService";
import * as Progress from "react-native-progress";
import * as Haptics from "expo-haptics";

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
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 12 }}
          style={styles.celebrationOverlay}
        >
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.95)", "rgba(5, 150, 105, 0.95)"]}
            style={styles.celebrationContent}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={60}
              color="#FFFFFF"
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
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.progressSection}
        >
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
            color="#667eea"
            unfilledColor={textTertiary + "20"}
            borderWidth={0}
            thickness={5}
            textStyle={{
              fontSize: 14,
              color: textColor,
            }}
          />
        </View>

        {/* Progress Bar */}
        <Progress.Bar
          progress={progress}
          width={null}
          height={4}
          color="#667eea"
          unfilledColor={textTertiary + "15"}
          borderWidth={0}
          borderRadius={2}
          style={styles.progressBar}
        />

        {/* Reading Title */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
          style={styles.titleSection}
        >
          <Text style={[styles.readingTitle, { color: textColor }]}>
            {currentReading.title || currentReading.reference}
          </Text>
          <View style={[styles.referenceChip, { backgroundColor: cardBg }]}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={14}
              color="#667eea"
            />
            <Text style={styles.referenceText}>{currentReading.reference}</Text>
          </View>
        </View>

        {/* Verse Content */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={[styles.contentCard, { backgroundColor: cardBg }]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#667eea" />
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
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
          style={[styles.progressOverview, { backgroundColor: cardBg }]}
        >
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
      <MotiView
        from={{ opacity: 0, translateY: 100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 20, delay: 300 }}
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
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButtonGradient}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#FFFFFF"
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
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextDayGradient}
                >
                  <Text style={styles.nextDayText}>Next Day</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color="#FFFFFF"
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
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    fontSize: 13,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  bottomBar: {
    borderTopColor: "rgba(0,0,0,0.05)",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: "absolute",
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    gap: 12,
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
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  celebrationText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  centerContent: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  completeButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  completeButtonGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 16,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  completedBadge: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  completedContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  completedText: {
    color: "#10b981",
    fontSize: 15,
  },
  container: {
    flex: 1,
  },
  contentCard: {
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 300,
    padding: 20,
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
  dayInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  dayText: {
    fontSize: 13,
  },
  dot: {
    backgroundColor: "#9ca3af",
    borderRadius: 1.5,
    height: 3,
    width: 3,
  },
  errorText: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 13,
  },
  nextDayButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  nextDayGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  nextDayText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  planName: {
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  progressBar: {
    marginBottom: 24,
  },
  progressDivider: {
    backgroundColor: "#e5e7eb",
    height: "70%",
    marginHorizontal: 16,
    width: 1,
  },
  progressInfo: {
    flex: 1,
    marginRight: 16,
  },
  progressOverview: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
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
  progressSection: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressStat: {
    alignItems: "center",
    flex: 1,
  },
  progressStatLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  progressStatValue: {
    fontSize: 18,
    marginBottom: 4,
  },
  progressStats: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  readingTitle: {
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 12,
  },
  referenceChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  referenceText: {
    color: "#667eea",
    fontSize: 13,
  },
  scrollContent: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 20,
  },
  verseContent: {
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 26,
  },
  verseScrollView: {
    maxHeight: 400,
  },
});
