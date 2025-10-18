import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { appleDesign } from "@/theme/appleDesign";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { readingPlansData } from "@/data/readingPlans";
import * as Progress from "react-native-progress";

export default function ReadingPlans() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const textTertiary = useThemeColor(theme.color.textTertiary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const readingPlans = useBibleStore((state) => state.readingPlans);
  const createReadingPlan = useBibleStore((state) => state.createReadingPlan);
  const activeReadingPlan = useBibleStore((state) => state.activeReadingPlan);
  const setActiveReadingPlan = useBibleStore(
    (state) => state.setActiveReadingPlan,
  );
  const readingStreak = useBibleStore((state) => state.readingStreak);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredPlans =
    selectedCategory === "All"
      ? readingPlansData
      : readingPlansData.filter((plan) => plan.difficulty === selectedCategory);

  const handleStartPlan = (planId: string) => {
    const planTemplate = readingPlansData.find((p) => p.id === planId);
    if (!planTemplate) return;

    const newPlanId = createReadingPlan(
      planTemplate.name,
      planTemplate.description,
      planTemplate.readings,
    );

    setActiveReadingPlan(newPlanId);

    setTimeout(() => {
      router.push({
        pathname: "/reading-plan-day",
        params: { planId: newPlanId },
      });
    }, 100);
  };

  const handleContinuePlan = (planId: string) => {
    router.push({
      pathname: "/reading-plan-day",
      params: { planId },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "#10b981";
      case "Intermediate":
        return "#f59e0b";
      case "Advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Reading Plans",
          headerBackTitle: "Back",
          headerTintColor: textColor,
          headerStyle: { backgroundColor },
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Reading Stats */}
        <View>
          <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
            <View style={styles.statsHeader}>
              <Text style={[styles.statsTitle, { color: textColor }]}>
                Your Reading Journey
              </Text>
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color={textSecondary}
              />
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: "#667eea20" }]}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color="#667eea"
                  />
                </View>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {readingStreak.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>
                  Day Streak
                </Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: "#10b98120" }]}
                >
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={20}
                    color="#10b981"
                  />
                </View>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {readingStreak.totalDaysRead}
                </Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>
                  Total Days
                </Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: "#f59e0b20" }]}
                >
                  <MaterialCommunityIcons
                    name="trophy"
                    size={20}
                    color="#f59e0b"
                  />
                </View>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {readingStreak.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>
                  Longest
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Plan */}
        {activeReadingPlan && readingPlans.length > 0 && (
          <View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleContinuePlan(readingPlans[0].id)}
              style={styles.activeCard}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeGradient}
              >
                <View style={styles.activeHeader}>
                  <View style={styles.activeBadge}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
                <Text style={styles.activePlanName}>
                  {readingPlans[0]?.name}
                </Text>
                <View style={styles.activeProgress}>
                  <Text style={styles.activeProgressText}>
                    Day {readingPlans[0]?.currentDay} of{" "}
                    {readingPlans[0]?.duration}
                  </Text>
                  <Progress.Bar
                    progress={
                      readingPlans[0]
                        ? readingPlans[0].currentDay / readingPlans[0].duration
                        : 0
                    }
                    width={null}
                    height={4}
                    color="#FFFFFF"
                    unfilledColor="rgba(255,255,255,0.25)"
                    borderWidth={0}
                    borderRadius={2}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Filters */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedCategory === category ? textColor : cardBg,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedCategory === category
                          ? backgroundColor
                          : textSecondary,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Plans List */}
        <View style={styles.plansList}>
          {filteredPlans.map((plan, index) => (
            <View
              key={plan.id}
              style={[styles.planCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planMeta}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor:
                          getDifficultyColor(plan.difficulty) + "15",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.difficultyDot,
                        {
                          backgroundColor: getDifficultyColor(plan.difficulty),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(plan.difficulty) },
                      ]}
                    >
                      {plan.difficulty}
                    </Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={textTertiary}
                    />
                    <Text
                      style={[styles.durationText, { color: textSecondary }]}
                    >
                      {plan.duration} days
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.planName, { color: textColor }]}>
                {plan.name}
              </Text>

              <Text
                style={[styles.planDescription, { color: textSecondary }]}
                numberOfLines={2}
              >
                {plan.description}
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartPlan(plan.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Plan</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#667eea"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Active Plan Card
  activeBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },
  activeCard: {
    borderRadius: 20,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  activeGradient: {
    padding: spacing.lg,
  },
  activeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  activePlanName: {
    color: "#FFFFFF",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  activeProgress: {
    gap: spacing.sm,
  },
  activeProgressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: fontSize.sm,
  },
  container: {
    flex: 1,
  },
  difficultyBadge: {
    alignItems: "center",
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  difficultyDot: {
    borderRadius: borderRadius.sm,
    height: 6,
    width: 6,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  durationBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  durationText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  // Filter Section
  filterChip: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  filterScroll: {
    gap: spacing.sm,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // Plans List
  planCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
  planDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  plansList: {
    gap: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  startButton: {
    alignItems: "center",
    borderColor: "#667eea",
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  startButtonText: {
    color: "#667eea",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // Stats Section
  statsCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
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
  statsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: borderRadius.lg,
    height: 48,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 48,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
});
