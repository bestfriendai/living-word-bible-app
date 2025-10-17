import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  memorizationService,
  MemorizedVerse,
} from "@/services/memorizationService";

interface VerseWithExercise extends MemorizedVerse {
  currentExercise?: {
    prompt: string;
    answer: string;
  };
}

export default function Memorization() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const [verses, setVerses] = useState<MemorizedVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<VerseWithExercise | null>(
    null,
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    const allVerses = await memorizationService.getAll();
    setVerses(allVerses);
  };

  const handleAddVerse = () => {
    Alert.prompt(
      "Add Verse",
      "Enter verse reference (e.g., John 3:16)",
      async (reference) => {
        if (reference) {
          try {
            await memorizationService.addVerse(
              reference,
              "Example verse text - integrate with Bible API",
            );
            loadVerses();
            Alert.alert("Success", "Verse added for memorization!");
          } catch {
            Alert.alert("Error", "Failed to add verse");
          }
        }
      },
    );
  };

  const handleReview = async (verse: MemorizedVerse) => {
    const exercise = memorizationService.generateFillInBlank(verse, 3);
    setSelectedVerse({
      ...verse,
      currentExercise: {
        prompt: exercise.text,
        answer: exercise.blanks.join(", "),
      },
    });
    setIsReviewing(true);
    setUserAnswer("");
    setShowAnswer(false);
  };

  const handleSubmitReview = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!selectedVerse) return;

    try {
      const updated = await memorizationService.reviewVerse(
        selectedVerse.id,
        quality,
      );
      Alert.alert(
        "Review Recorded",
        `Next review: ${new Date(updated.nextReviewDate).toLocaleDateString()}`,
      );
      setIsReviewing(false);
      setSelectedVerse(null);
      loadVerses();
    } catch {
      Alert.alert("Error", "Failed to record review");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Mastered":
        return "#10b981";
      case "Mature":
        return "#3b82f6";
      case "Young":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  const versesDueForReview = verses.filter(
    (v) => new Date(v.nextReviewDate) <= new Date() && !v.mastered,
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Verse Memorization",
          headerBackTitle: "Back",
        }}
      />

      {!isReviewing ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textColor }]}>
                Memorization
              </Text>
              <Text style={[styles.subtitle, { color: textColor + "70" }]}>
                {verses.length} verses • {versesDueForReview.length} due today
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddVerse}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: "#10b981" }]}>
              <Text style={styles.statNumber}>
                {verses.filter((v) => v.level === "Mastered").length}
              </Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.statNumber}>{versesDueForReview.length}</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
          </View>

          {/* Verses Due for Review */}
          {versesDueForReview.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Due for Review
              </Text>
              {versesDueForReview.map((verse) => (
                <TouchableOpacity
                  key={verse.id}
                  style={[styles.verseCard, { backgroundColor: cardBg }]}
                  onPress={() => handleReview(verse)}
                >
                  <View style={styles.verseHeader}>
                    <Text style={[styles.verseReference, { color: textColor }]}>
                      {verse.reference}
                    </Text>
                  </View>
                  <Text
                    style={[styles.verseText, { color: textColor }]}
                    numberOfLines={3}
                  >
                    {verse.text}
                  </Text>
                  <View style={styles.masteryContainer}>
                    <Text
                      style={[
                        styles.masteryLabel,
                        { color: getLevelColor(verse.level) },
                      ]}
                    >
                      {verse.level}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReview(verse)}
                  >
                    <View
                      style={[
                        styles.reviewButtonInner,
                        { backgroundColor: "#667eea" },
                      ]}
                    >
                      <Text style={styles.reviewButtonText}>Review Now</Text>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* All Verses */}
          {verses.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                All Verses
              </Text>
              {verses.map((verse) => (
                <View
                  key={verse.id}
                  style={[styles.verseCard, { backgroundColor: cardBg }]}
                >
                  <View style={styles.verseHeader}>
                    <Text style={[styles.verseReference, { color: textColor }]}>
                      {verse.reference}
                    </Text>
                  </View>
                  <Text
                    style={[styles.verseText, { color: textColor }]}
                    numberOfLines={3}
                  >
                    {verse.text}
                  </Text>
                  <View style={styles.masteryContainer}>
                    <Text
                      style={[
                        styles.masteryLabel,
                        { color: getLevelColor(verse.level) },
                      ]}
                    >
                      {verse.level}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReview(verse)}
                  >
                    <View
                      style={[
                        styles.reviewButtonInner,
                        { backgroundColor: "#667eea" },
                      ]}
                    >
                      <Text style={styles.reviewButtonText}>Review</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // Review Mode
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsReviewing(false);
                setSelectedVerse(null);
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
            <Text style={[styles.reviewTitle, { color: textColor }]}>
              Review
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            style={styles.reviewScrollView}
            contentContainerStyle={styles.reviewContent}
          >
            <Text style={[styles.reviewReference, { color: textColor }]}>
              {selectedVerse?.reference}
            </Text>

            {selectedVerse?.currentExercise && (
              <>
                <Text
                  style={[styles.exercisePrompt, { color: textColor + "D0" }]}
                >
                  {selectedVerse.currentExercise.prompt}
                </Text>

                <TextInput
                  style={[
                    styles.answerInput,
                    {
                      backgroundColor: cardBg,
                      color: textColor,
                      borderColor: cardBg,
                    },
                  ]}
                  placeholder="Type the missing words..."
                  placeholderTextColor={textColor + "50"}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.showAnswerButton}
                  onPress={() => setShowAnswer(!showAnswer)}
                >
                  <Text style={styles.showAnswerText}>
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                  </Text>
                </TouchableOpacity>

                {showAnswer && (
                  <View
                    style={[styles.answerCard, { backgroundColor: cardBg }]}
                  >
                    <Text style={[styles.answerText, { color: textColor }]}>
                      {selectedVerse.currentExercise.answer}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.ratingSection}>
              <Text style={[styles.ratingTitle, { color: textColor }]}>
                How well did you remember?
              </Text>
              <View style={styles.ratingButtons}>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.ratingFailed]}
                  onPress={() => handleSubmitReview(0)}
                >
                  <Text style={styles.ratingButtonText}>Need to Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.ratingGood]}
                  onPress={() => handleSubmitReview(4)}
                >
                  <Text style={styles.ratingButtonText}>Got It!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  answerCard: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
  },
  answerInput: {
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    minHeight: 120,
    padding: 16,
  },
  answerText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    flex: 1,
  },
  exercisePrompt: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 24,
    textAlign: "center",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  masteryContainer: {
    marginBottom: 16,
    paddingVertical: 12,
  },
  masteryLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  ratingButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 52,
    paddingVertical: 16,
  },
  ratingButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  ratingButtons: {
    gap: 16,
  },
  ratingFailed: {
    backgroundColor: "#ef4444",
  },
  ratingGood: {
    backgroundColor: "#10b981",
  },
  ratingSection: {
    marginTop: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  reviewButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  reviewButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewContainer: {
    flex: 1,
  },
  reviewContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  reviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reviewReference: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  reviewScrollView: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  showAnswerButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: 20,
    minHeight: 48,
    paddingVertical: 14,
  },
  showAnswerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statCard: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 100,
    padding: 20,
  },
  statLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  statNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  verseCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  verseHeader: {
    marginBottom: 16,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: "bold",
  },
  verseText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
