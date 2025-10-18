import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useBibleStore } from "@/store/bibleStore";
import { ThemedCard } from "@/components/ThemedCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { achievementsData } from "@/data/achievements";
import { socialSharingService } from "@/services/socialSharingService";

import type { Achievement } from "@/data/achievements";
import { colors } from "@/theme/colors";
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

  const styles = StyleSheet.create({
    achievementCard: {
      marginBottom: 12,
      marginHorizontal: 20,
      padding: 16,
    },
    achievementDescription: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    achievementHeader: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: 8,
    },
    achievementIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    achievementPoints: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "bold",
    },
    achievementTitle: {
      color: isDark ? colors.dark.text : colors.text.primary,
      flex: 1,
      fontSize: 16,
      fontWeight: "bold",
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryTitle: {
      color: isDark ? colors.dark.text : colors.text.primary,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    container: {
      backgroundColor: isDark
        ? colors.dark.background
        : colors.background.default,
      flex: 1,
    },
    header: {
      alignItems: "center",
      padding: 20,
    },
    lockedText: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: 12,
      marginTop: 8,
    },
    pointsContainer: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    pointsText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    progressBar: {
      backgroundColor: isDark ? colors.dark.border : colors.border.default,
      borderRadius: 4,
      height: 8,
      overflow: "hidden",
    },
    progressFill: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      height: "100%",
    },
    shareButton: {
      padding: 8,
    },
    statCard: {
      alignItems: "center",
      backgroundColor: isDark ? colors.dark.card : colors.background.card,
      borderRadius: 12,
      flex: 1,
      marginHorizontal: 8,
      padding: 16,
    },
    statLabel: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: 12,
      textAlign: "center",
    },
    statNumber: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    subtitle: {
      color: isDark ? colors.dark.textSecondary : colors.text.secondary,
      fontSize: 16,
      marginBottom: 16,
    },
    title: {
      color: isDark ? colors.dark.text : colors.text.primary,
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
    },
    unlockedText: {
      color: colors.success,
      fontSize: 12,
      fontStyle: "italic",
      marginTop: 8,
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
      <ThemedCard key={achievement.id} style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <Text style={styles.achievementTitle}>{achievement.name}</Text>
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
        <Text style={styles.achievementDescription}>
          {achievement.description}
        </Text>
        {!unlocked && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}
        {unlocked ? (
          <Text style={styles.unlockedText}>
            Unlocked {new Date(unlockedDate!).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={styles.lockedText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        )}
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
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{totalPoints} Total Points</Text>
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
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statCard}>
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
