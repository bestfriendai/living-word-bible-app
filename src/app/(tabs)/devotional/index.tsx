import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function Devotional() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);

  const verseOfTheDay = useBibleStore((state) => state.verseOfTheDay);
  const fetchVerseOfTheDay = useBibleStore((state) => state.fetchVerseOfTheDay);

  useEffect(() => {
    fetchVerseOfTheDay();
  }, []);

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
          <Text style={[styles.date, { color: textColor + "90" }]}>{dateString}</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: textColor }]}>Devotional</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => fetchVerseOfTheDay()}
            >
              <MaterialCommunityIcons name="refresh" size={24} color={textColor + "70"} />
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
              <LinearGradient
                colors={["#f97316", "#ea580c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.verseGradient}
              >
                <Text style={styles.verseReference}>{verseOfTheDay.reference}</Text>
                <Text style={styles.verseText}>"{verseOfTheDay.text}"</Text>
              </LinearGradient>
            </View>

            {/* Reflection Section */}
            <View style={styles.reflectionSection}>
              <Text style={[styles.reflectionTitle, { color: textColor }]}>Reflection</Text>
              <Text style={[styles.reflectionText, { color: textColor + "E0" }]}>
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
              Loading today's devotional...
            </Text>
          </View>
        )}
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
  date: {
    fontSize: 16,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  refreshButton: {
    padding: 8,
  },
  titleCard: {
    marginBottom: 24,
  },
  devotionalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 36,
  },
  verseCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 32,
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
    minHeight: 180,
  },
  verseReference: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  verseText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 30,
    fontStyle: "italic",
  },
  reflectionSection: {
    marginBottom: 32,
  },
  reflectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  reflectionText: {
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});
