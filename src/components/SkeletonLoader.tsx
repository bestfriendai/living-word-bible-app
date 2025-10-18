import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import { colors } from "../theme/colors";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  colorMode?: "light" | "dark";
}

/**
 * Base skeleton component with shimmer animation
 * Uses Moti for smooth 60fps animations
 */
export function SkeletonLoader({
  width = "100%",
  height = 20,
  radius = 8,
  colorMode,
}: SkeletonLoaderProps) {
  const isDark = colorMode === "dark";

  return (
    <Skeleton
      width={width as any}
      height={height as any}
      radius={radius}
      colorMode={isDark ? "dark" : "light"}
      colors={
        isDark
          ? [colors.dark.card, colors.dark.cardHover, colors.dark.card]
          : [
              colors.background.tertiary,
              colors.background.secondary,
              colors.background.tertiary,
            ]
      }
    />
  );
}

/**
 * Verse card skeleton for scripture search results
 */
export function VerseCardSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.verseCard}
    >
      {/* Reference */}
      <SkeletonLoader width={120} height={24} radius={6} />

      {/* Verse text - 3 lines */}
      <View style={styles.verseTextContainer}>
        <SkeletonLoader width="100%" height={18} radius={4} />
        <SkeletonLoader width="95%" height={18} radius={4} />
        <SkeletonLoader width="88%" height={18} radius={4} />
      </View>

      {/* Context box */}
      <View style={styles.contextBox}>
        <SkeletonLoader width={80} height={16} radius={4} />
        <SkeletonLoader width="100%" height={16} radius={4} />
        <SkeletonLoader width="70%" height={16} radius={4} />
      </View>

      {/* Button */}
      <SkeletonLoader width="100%" height={56} radius={16} />
    </MotiView>
  );
}

/**
 * Devotional skeleton for daily devotional screen
 */
export function DevotionalSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.devotionalContainer}
    >
      {/* Title */}
      <SkeletonLoader width={200} height={28} radius={8} />

      {/* Date */}
      <View style={styles.dateContainer}>
        <SkeletonLoader width={150} height={16} radius={4} />
      </View>

      {/* Verse reference */}
      <View style={styles.verseRefContainer}>
        <SkeletonLoader width={140} height={20} radius={6} />
      </View>

      {/* Verse text */}
      <View style={styles.verseBox}>
        <SkeletonLoader width="100%" height={20} radius={4} />
        <SkeletonLoader width="95%" height={20} radius={4} />
        <SkeletonLoader width="100%" height={20} radius={4} />
        <SkeletonLoader width="80%" height={20} radius={4} />
      </View>

      {/* Reflection - multiple paragraphs */}
      <View style={styles.reflectionContainer}>
        <SkeletonLoader width={100} height={22} radius={6} />
        <View style={styles.paragraph}>
          <SkeletonLoader width="100%" height={16} radius={4} />
          <SkeletonLoader width="100%" height={16} radius={4} />
          <SkeletonLoader width="100%" height={16} radius={4} />
          <SkeletonLoader width="90%" height={16} radius={4} />
        </View>
        <View style={styles.paragraph}>
          <SkeletonLoader width="100%" height={16} radius={4} />
          <SkeletonLoader width="100%" height={16} radius={4} />
          <SkeletonLoader width="75%" height={16} radius={4} />
        </View>
      </View>
    </MotiView>
  );
}

/**
 * Home screen verse of the day skeleton
 */
export function FeaturedVerseSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      style={styles.featuredCard}
    >
      {/* Badge */}
      <SkeletonLoader width={80} height={24} radius={12} />

      {/* Title */}
      <View style={styles.featuredTitle}>
        <SkeletonLoader width="80%" height={24} radius={6} />
      </View>

      {/* Verse */}
      <View style={styles.featuredVerse}>
        <SkeletonLoader width="100%" height={18} radius={4} />
        <SkeletonLoader width="95%" height={18} radius={4} />
        <SkeletonLoader width="85%" height={18} radius={4} />
      </View>

      {/* Reference */}
      <SkeletonLoader width={120} height={16} radius={4} />
    </MotiView>
  );
}

/**
 * List skeleton for journal entries or saved verses
 */
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{
            type: "timing",
            duration: 300,
            delay: index * 100,
          }}
          style={styles.listItem}
        >
          <SkeletonLoader width={60} height={60} radius={12} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="70%" height={18} radius={4} />
            <SkeletonLoader width="50%" height={14} radius={4} />
          </View>
        </MotiView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  contextBox: {
    gap: 8,
    marginTop: 8,
  },
  dateContainer: {
    marginTop: 8,
  },
  devotionalContainer: {
    gap: 20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    backgroundColor: colors.background.card,
    borderRadius: 24,
    gap: 16,
    padding: 24,
  },
  featuredTitle: {
    marginTop: 8,
  },
  featuredVerse: {
    gap: 10,
    marginTop: 12,
  },
  listItem: {
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: 16,
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    padding: 16,
  },
  listItemContent: {
    flex: 1,
    gap: 8,
  },
  paragraph: {
    gap: 8,
    marginTop: 12,
  },
  reflectionContainer: {
    gap: 16,
    marginTop: 24,
  },
  verseBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    gap: 12,
    marginTop: 16,
    padding: 20,
  },
  verseCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    gap: 16,
    marginBottom: 24,
    padding: 28,
  },
  verseRefContainer: {
    marginTop: 16,
  },
  verseTextContainer: {
    gap: 12,
    marginTop: 8,
  },
});
