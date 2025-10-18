import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useBibleStore } from "@/store/bibleStore";
import { ThemedCard } from "@/components/ThemedCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { achievementsData } from "@/data/achievements";
import { socialSharingService } from "@/services/socialSharingService";
import { LinearGradient } from "expo-linear-gradient";

import type { Achievement } from "@/data/achievements";
import { colors } from "@/theme/colors";
import { appleDesign } from "@/theme/appleDesign";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function AchievementsScreen() {
  const { isDark } = useAppTheme();
  const { achievements, totalPoints, getAchievementProgress } = useBibleStore();

  const handleShareAchievement = async (achievement: Achievement) => {
    try {
      await socialSharingService.shareAchievement(
        achievement.name,
        achievement.description,
        achievement.points,
      );
    } catch (error) {
      console.error("Error sharing achievement:", error);
    }
  };

  const handleShareProgress = async () => {
    try {
      await socialSharingService.shareReadingProgress(
        0, // streakDays - not available in this context
        totalPoints, // using totalPoints as totalVerses
        achievements.length, // using achievements as completedPlans
      );
    } catch (error) {
      console.error("Error sharing progress:", error);
    }
  };

  const { width } = Dimensions.get("window");

  const styles = StyleSheet.create({
    achievementCard: {
      borderColor: isDark ? colors.dark.border : colors.border.default,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      marginBottom: spacing.md,
      marginHorizontal: spacing.lg,
      padding: spacing.lg,
    },
    achievementDescription: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: fontSize.sm,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    achievementHeader: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: spacing.sm,
    },
    achievementIcon: {
      fontSize: fontSize.xl,
      marginRight: spacing.md,
    },
    achievementPoints: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    achievementTitle: {
      color: isDark ? colors.dark.text : colors.text.primary,
      flex: 1,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    categorySection: {
      marginBottom: spacing.xl,
    },
    categoryTitle: {
      color: isDark ? colors.dark.text : colors.text.primary,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    container: {
      backgroundColor: isDark
        ? colors.dark.background
        : colors.background.default,
      flex: 1,
    },
    header: {
      alignItems: "center",
      padding: spacing.lg,
      paddingTop: spacing.xl,
    },
    lockedText: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: fontSize.xs,
      marginTop: spacing.sm,
    },
    pointsContainer: {
      alignItems: "center",
      borderRadius: borderRadius.xl,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
      marginHorizontal: spacing.lg,
      overflow: "hidden",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    pointsText: {
      color: "white",
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
    },
    progressBar: {
      backgroundColor: isDark ? colors.dark.border : colors.border.default,
      borderRadius: borderRadius.sm,
      height: 8,
      marginTop: spacing.sm,
      overflow: "hidden",
    },
    progressFill: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      height: "100%",
    },
    shareButton: {
      padding: spacing.sm,
    },
    statCard: {
      alignItems: "center",
      backgroundColor: isDark ? colors.dark.card : colors.background.card,
      borderRadius: borderRadius.xl,
      elevation: 2,
      flex: 1,
      marginHorizontal: spacing.sm,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    statLabel: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      textAlign: "center",
    },
    statNumber: {
      color: colors.primary,
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.xs,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    subtitle: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: fontSize.md,
      marginBottom: spacing.md,
      textAlign: "center",
    },
    title: {
      color: isDark ? colors.dark.text : colors.text.primary,
      fontSize: fontSize.xxxl + 4,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.sm,
    },
    unlockedText: {
      color: colors.success,
      fontSize: fontSize.xs,
      fontStyle: "italic",
      marginTop: spacing.sm,
    },
  });

  const getAchievementsByCategory = () => {
    const categories = {
      reading: achievementsData.filter((a) => a.category === "reading"),
      streak: achievementsData.filter((a) => a.category === "streak"),
      milestone: achievementsData.filter((a) => a.category === "milestone"),
      special: achievementsData.filter((a) => a.category === "special"),
    };
    return categories;
  };

  const isUnlocked = (achievementId: string) => {
    return achievements.some((a) => a.id === achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    return achievement?.unlockedAt;
  };

  const renderAchievement = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement.id);
    const progress = getAchievementProgress(achievement.id);
    const unlockedDate = getUnlockedDate(achievement.id);

    return (
      <ThemedCard
        key={achievement.id}
        style={styles.achievementCard}
        elevated={unlocked}
      >
        <View style={styles.achievementHeader}>
          <View
            style={{
              opacity: unlocked ? 1 : 0.5,
            }}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.achievementTitle,
                unlocked && { color: colors.success },
              ]}
            >
              {achievement.name}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.achievementPoints}>+{achievement.points}</Text>
            {unlocked && (
              <TouchableOpacity
                onPress={() => handleShareAchievement(achievement)}
                style={styles.shareButton}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!unlocked && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {unlocked ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={colors.success}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.unlockedText}>
                Unlocked {new Date(unlockedDate!).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.lockedText}>
              {Math.round(progress * 100)}% Complete
            </Text>
          )}
        </View>
      </ThemedCard>
    );
  };

  const categories = getAchievementsByCategory();
  const unlockedCount = achievements.length;
  const totalCount = achievementsData.length;
  const completionRate = Math.round((unlockedCount / totalCount) * 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          Track your spiritual journey and milestones
        </Text>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pointsContainer}
        >
          <View>
            <Text style={styles.pointsText}>{totalPoints}</Text>
            <Text
              style={{ color: "rgba(255,255,255,0.8)", fontSize: fontSize.sm }}
            >
              Total Points
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleShareProgress}
            style={styles.shareButton}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="trophy"
            size={24}
            color={colors.success}
            style={{ marginBottom: spacing.xs }}
          />
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="progress-check"
            size={24}
            color={colors.primary}
            style={{ marginBottom: spacing.xs }}
          />
          <Text style={styles.statNumber}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="target"
            size={24}
            color={colors.warning}
            style={{ marginBottom: spacing.xs }}
          />
          <Text style={styles.statNumber}>{totalCount - unlockedCount}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>📖 Reading Achievements</Text>
        {categories.reading.map(renderAchievement)}
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🔥 Streak Achievements</Text>
        {categories.streak.map(renderAchievement)}
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🎯 Milestone Achievements</Text>
        {categories.milestone.map(renderAchievement)}
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>⭐ Special Achievements</Text>
        {categories.special.map(renderAchievement)}
      </View>
    </ScrollView>
  );
}
