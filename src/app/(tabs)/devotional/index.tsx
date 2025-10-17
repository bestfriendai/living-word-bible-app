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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { VerseImageGenerator } from "@/components/VerseImageGenerator";
import { ttsService } from "@/utils/textToSpeech";

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
  const preferredTranslation = useBibleStore(
    (state) => state.preferredTranslation,
  );
  const setPreferredTranslation = useBibleStore(
    (state) => state.setPreferredTranslation,
  );

  useEffect(() => {
    fetchVerseOfTheDay();
  }, []);

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
            colors={["#f97316"]}
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
              <View
                style={[styles.verseGradient, { backgroundColor: "#f97316" }]}
              >
                <Text style={styles.verseReference}>
                  {verseOfTheDay.reference}
                </Text>
                <Text style={styles.verseText}>"{verseOfTheDay.text}"</Text>
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
                    { backgroundColor: isPlaying ? "#ef4444" : "#8b5cf6" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isPlaying ? "stop" : "volume-high"}
                    size={28}
                    color="#fff"
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
                  style={[
                    styles.actionButtonInner,
                    { backgroundColor: "#3b82f6" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={28}
                    color="#fff"
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
              Loading today's devotional...
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
  container: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    marginBottom: 6,
  },
  devotionalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
  },
  header: {
    marginBottom: 24,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  reflectionSection: {
    marginBottom: 24,
  },
  reflectionText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 26,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  refreshButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    flex: 1,
    overflow: "hidden",
  },
  actionButtonInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 18,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  audioButton: {},
  shareButton: {},
  shareButtonInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  titleCard: {
    marginBottom: 20,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verseCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  verseGradient: {
    justifyContent: "center",
    minHeight: 200,
    padding: 24,
  },
  verseReference: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  verseText: {
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "600",
    lineHeight: 28,
  },
});
