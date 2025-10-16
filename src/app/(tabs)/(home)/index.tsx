import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const verseOfTheDay = useBibleStore((state) => state.verseOfTheDay);
  const fetchVerseOfTheDay = useBibleStore((state) => state.fetchVerseOfTheDay);
  const journalEntries = useBibleStore((state) => state.journalEntries);

  useEffect(() => {
    fetchVerseOfTheDay();
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: theme.color.reactBlue.dark }]}>
              <Text style={styles.logoText}>📖</Text>
            </View>
            <Text style={styles.brandText}>Vibecode</Text>
          </View>
          <View style={styles.greeting}>
            <Text style={[styles.greetingText, { color: textColor + "90" }]}>Good morning</Text>
            <Text style={[styles.title, { color: textColor }]}>Living Word</Text>
          </View>
        </View>

        {/* Verse of the Day Card */}
        {verseOfTheDay && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/devotional")}
            style={styles.verseCard}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.verseGradient}
            >
              <View style={styles.verseBadge}>
                <Text style={styles.verseBadgeText}>VERSE OF THE DAY</Text>
              </View>
              <Text style={styles.verseText} numberOfLines={3}>
                "{verseOfTheDay.text.substring(0, 100)}..."
              </Text>
              <View style={styles.verseFooter}>
                <Text style={styles.verseReference}>{verseOfTheDay.reference}</Text>
                <View style={styles.arrowCircle}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: cardBg }]}
            onPress={() => router.push("/scripture")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#3b82f620" }]}>
              <MaterialCommunityIcons name="book-search" size={32} color="#3b82f6" />
            </View>
            <Text style={[styles.actionTitle, { color: textColor }]}>Scripture</Text>
            <Text style={[styles.actionSubtitle, { color: textColor + "70" }]}>
              Find guidance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: cardBg }]}
            onPress={() => router.push("/journal")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#a855f720" }]}>
              <MaterialCommunityIcons name="notebook-edit" size={32} color="#a855f7" />
            </View>
            <Text style={[styles.actionTitle, { color: textColor }]}>Journal</Text>
            <Text style={[styles.actionSubtitle, { color: textColor + "70" }]}>
              Track prayers
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Features Section */}
        <View style={styles.dailySection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>AI Assistant</Text>

          <TouchableOpacity
            style={[styles.dailyCard, { backgroundColor: cardBg }]}
            onPress={() => router.push("/prayer-buddy")}
          >
            <LinearGradient
              colors={["#a855f7", "#ec4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dailyIcon}
            >
              <Text style={styles.dailyEmoji}>💬</Text>
            </LinearGradient>
            <View style={styles.dailyContent}>
              <Text style={[styles.dailyTitle, { color: textColor }]}>Prayer Buddy</Text>
              <Text style={[styles.dailySubtitle, { color: textColor + "70" }]}>
                Chat with your AI spiritual companion
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={textColor + "40"}
            />
          </TouchableOpacity>
        </View>

        {/* Daily Section */}
        <View style={styles.dailySection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Daily</Text>

          <TouchableOpacity
            style={[styles.dailyCard, { backgroundColor: cardBg }]}
            onPress={() => router.push("/devotional")}
          >
            <View style={[styles.dailyIcon, { backgroundColor: "#fbbf2420" }]}>
              <Text style={styles.dailyEmoji}>☀️</Text>
            </View>
            <View style={styles.dailyContent}>
              <Text style={[styles.dailyTitle, { color: textColor }]}>Morning Devotional</Text>
              <Text style={[styles.dailySubtitle, { color: textColor + "70" }]}>
                Start your day with reflection
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={textColor + "40"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dailyCard, { backgroundColor: cardBg }]}
            onPress={() => router.push("/devotional")}
          >
            <View style={[styles.dailyIcon, { backgroundColor: "#ec489920" }]}>
              <Text style={styles.dailyEmoji}>❤️</Text>
            </View>
            <View style={styles.dailyContent}>
              <Text style={[styles.dailyTitle, { color: textColor }]}>Today's Verse</Text>
              <Text style={[styles.dailySubtitle, { color: textColor + "70" }]}>
                Daily inspiration from scripture
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={textColor + "40"}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
  },
  brandText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  greeting: {
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  verseCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  verseGradient: {
    padding: 24,
    minHeight: 200,
    justifyContent: "space-between",
  },
  verseBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  verseBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  verseText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    marginBottom: 16,
  },
  verseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verseReference: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    minHeight: 160,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  dailySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dailyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  dailyIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dailyEmoji: {
    fontSize: 28,
  },
  dailyContent: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  dailySubtitle: {
    fontSize: 14,
  },
});
