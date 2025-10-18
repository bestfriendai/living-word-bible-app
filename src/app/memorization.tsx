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
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { colors } from "@/theme/colors";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  memorizationService,
  MemorizedVerse,
} from "@/services/memorizationService";
import { bibleApiService } from "@/services/bibleApiService";
import { LinearGradient } from "expo-linear-gradient";

type ExerciseType =
  | "fill-blank"
  | "first-letter"
  | "word-scramble"
  | "progressive"
  | "typing";

interface VerseWithExercise extends MemorizedVerse {
  currentExercise?: {
    type: ExerciseType;
    prompt: string;
    answer: string | string[];
    stages?: string[];
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
  const [exerciseType, setExerciseType] = useState<ExerciseType>("fill-blank");
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAddVerse, setShowAddVerse] = useState(false);
  const [newVerseRef, setNewVerseRef] = useState("");
  const [newVerseText, setNewVerseText] = useState("");
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [reviewStartTime, setReviewStartTime] = useState<number>(0);
  const [progressiveStage, setProgressiveStage] = useState(0);
  const [scrambledOrder, setScrambledOrder] = useState<string[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    learning: 0,
    young: 0,
    mature: 0,
    mastered: 0,
    dueToday: 0,
    averageEaseFactor: 0,
  });
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastReviewDate: null as string | null,
  });
  const [achievements, setAchievements] = useState<
    {
      id: string;
      title: string;
      description: string;
      unlocked: boolean;
      progress: number;
      icon: string;
    }[]
  >([]);
  const [analytics, setAnalytics] = useState({
    totalTimeSpent: 0,
    averageAccuracy: 0,
    versesReviewedToday: 0,
    weeklyProgress: [] as { date: string; reviewCount: number }[],
    categoryBreakdown: [] as { category: string; count: number }[],
  });

  useEffect(() => {
    loadVerses();
    loadStats();
  }, []);

  const loadVerses = async () => {
    const allVerses = await memorizationService.getAll();
    setVerses(allVerses);
  };

  const loadStats = async () => {
    const s = await memorizationService.getStats();
    const str = await memorizationService.getStreak();
    const ach = await memorizationService.getAchievements();
    const anal = await memorizationService.getProgressAnalytics();

    setStats(s);
    setStreak(str);
    setAchievements(ach);
    setAnalytics(anal);
  };

  const handleLookupVerse = async () => {
    if (!newVerseRef.trim()) {
      Alert.alert("Error", "Please enter a verse reference");
      return;
    }

    setIsLoadingVerse(true);
    try {
      const verseText = await bibleApiService.getVerse(newVerseRef);

      if (verseText) {
        setNewVerseText(verseText);
      } else {
        Alert.alert(
          "Not Found",
          "Could not find that verse. You can enter the text manually.",
        );
      }
    } catch (error) {
      console.error("Error looking up verse:", error);
      Alert.alert(
        "Error",
        "Failed to look up verse. You can enter the text manually.",
      );
    } finally {
      setIsLoadingVerse(false);
    }
  };

  const handleAddVerse = async () => {
    if (!newVerseRef.trim() || !newVerseText.trim()) {
      Alert.alert("Error", "Please enter both reference and text");
      return;
    }

    try {
      await memorizationService.addVerse(
        newVerseRef.trim(),
        newVerseText.trim(),
      );
      loadVerses();
      loadStats();
      setShowAddVerse(false);
      setNewVerseRef("");
      setNewVerseText("");
      Alert.alert("Success", "Verse added for memorization!");
    } catch {
      Alert.alert("Error", "Failed to add verse");
    }
  };

  const handleReview = async (verse: MemorizedVerse) => {
    let exercise: any;

    switch (exerciseType) {
      case "fill-blank":
        exercise = memorizationService.generateFillInBlank(verse, 3);
        setSelectedVerse({
          ...verse,
          currentExercise: {
            type: exerciseType,
            prompt: exercise.text,
            answer: exercise.blanks.join(", "),
          },
        });
        break;
      case "first-letter":
        exercise = memorizationService.generateFirstLetterExercise(verse);
        setSelectedVerse({
          ...verse,
          currentExercise: {
            type: exerciseType,
            prompt: exercise.text,
            answer: exercise.answer,
          },
        });
        break;
      case "word-scramble":
        exercise = memorizationService.generateWordScrambleExercise(verse);
        setScrambledOrder([...exercise.scrambledWords]);
        setSelectedVerse({
          ...verse,
          currentExercise: {
            type: exerciseType,
            prompt: "Tap words in correct order:",
            answer: exercise.correctOrder,
          },
        });
        break;
      case "progressive":
        exercise = memorizationService.generateProgressiveRevealExercise(verse);
        setProgressiveStage(0);
        setSelectedVerse({
          ...verse,
          currentExercise: {
            type: exerciseType,
            prompt: "Tap to reveal more",
            answer: verse.text,
            stages: exercise.stages,
          },
        });
        break;
      case "typing":
        exercise = memorizationService.generateTypingExercise(verse);
        setSelectedVerse({
          ...verse,
          currentExercise: {
            type: exerciseType,
            prompt: exercise.prompt,
            answer: exercise.answer,
          },
        });
        break;
    }

    setIsReviewing(true);
    setUserAnswer("");
    setShowAnswer(false);
    setHintsUsed(0);
    setReviewStartTime(Date.now());
  };

  const handleSubmitReview = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!selectedVerse) return;

    const timeSpent = Date.now() - reviewStartTime;

    try {
      const updated = await memorizationService.reviewVerse(
        selectedVerse.id,
        quality,
        {
          hintsUsed,
          timeSpent,
        },
      );

      Alert.alert(
        "Review Recorded!",
        `Next review: ${new Date(updated.nextReviewDate).toLocaleDateString()}\nInterval: ${updated.interval} days`,
      );

      setIsReviewing(false);
      setSelectedVerse(null);
      setScrambledOrder([]);
      setProgressiveStage(0);
      loadVerses();
      loadStats();
    } catch {
      Alert.alert("Error", "Failed to record review");
    }
  };

  const handleUseHint = () => {
    setHintsUsed(hintsUsed + 1);
    setShowAnswer(true);
  };

  const handleProgressiveReveal = () => {
    if (
      selectedVerse?.currentExercise?.stages &&
      progressiveStage < selectedVerse.currentExercise.stages.length - 1
    ) {
      setProgressiveStage(progressiveStage + 1);
    }
  };

  const handleWordTap = (word: string, index: number) => {
    setUserAnswer((prev) => (prev ? `${prev} ${word}` : word));
    const newOrder = scrambledOrder.filter((_, i) => i !== index);
    setScrambledOrder(newOrder);
  };

  const resetScramble = () => {
    if (selectedVerse?.currentExercise?.type === "word-scramble") {
      const words = (selectedVerse.text || "").split(" ");
      setScrambledOrder([...words].sort(() => Math.random() - 0.5));
      setUserAnswer("");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Mastered":
        return colors.success;
      case "Mature":
        return colors.primary;
      case "Young":
        return colors.warning;
      default:
        return colors.error;
    }
  };

  const versesDueForReview = verses.filter(
    (v) => new Date(v.nextReviewDate) <= new Date() && !v.mastered,
  );

  const exerciseTypes: { type: ExerciseType; label: string; icon: string }[] = [
    { type: "fill-blank", label: "Fill Blanks", icon: "form-textbox" },
    {
      type: "first-letter",
      label: "First Letter",
      icon: "alpha-a-circle-outline",
    },
    { type: "word-scramble", label: "Scramble", icon: "shuffle-variant" },
    { type: "progressive", label: "Progressive", icon: "eye-outline" },
    { type: "typing", label: "Type Full", icon: "keyboard-outline" },
  ];

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
            {
              paddingTop: spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
            },
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddVerse(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* Streak Display */}
          {streak.currentStreak > 0 && (
            <LinearGradient
              colors={[colors.error, colors.errorLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.streakCard}
            >
              <MaterialCommunityIcons
                name="fire"
                size={32}
                color={colors.white}
              />
              <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
                <Text style={styles.streakLabel}>Day Streak!</Text>
              </View>
            </LinearGradient>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.success }]}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statNumber}>
                {verses.filter((v) => v.level === "Mastered").length}
              </Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.warning }]}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statNumber}>{versesDueForReview.length}</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.purpleLight }]}
              onPress={() => setShowAchievements(true)}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={32}
                color={colors.text.inverse}
              />
              <Text style={styles.statLabel}>Achievements</Text>
            </TouchableOpacity>
          </View>

          {/* Exercise Type Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Exercise Type
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exerciseTypeContainer}
            >
              {exerciseTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.exerciseTypeButton,
                    {
                      backgroundColor:
                        exerciseType === type.type ? colors.primary : cardBg,
                    },
                  ]}
                  onPress={() => setExerciseType(type.type)}
                >
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={24}
                    color={
                      exerciseType === type.type
                        ? colors.text.inverse
                        : textColor
                    }
                  />
                  <Text
                    style={[
                      styles.exerciseTypeLabel,
                      {
                        color:
                          exerciseType === type.type
                            ? colors.text.inverse
                            : textColor,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                    {verse.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {verse.category}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.verseText, { color: textColor }]}
                    numberOfLines={3}
                  >
                    {verse.text}
                  </Text>
                  <View style={styles.verseFooter}>
                    <Text
                      style={[
                        styles.masteryLabel,
                        { color: getLevelColor(verse.level) },
                      ]}
                    >
                      {verse.level}
                    </Text>
                    {verse.accuracy !== undefined && verse.accuracy > 0 && (
                      <Text
                        style={[
                          styles.accuracyText,
                          { color: textColor + "80" },
                        ]}
                      >
                        {verse.accuracy}% accuracy
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReview(verse)}
                  >
                    <View
                      style={[
                        styles.reviewButtonInner,
                        { backgroundColor: colors.primary },
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
                All Verses ({verses.length})
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
                    {verse.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {verse.category}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.verseText, { color: textColor }]}
                    numberOfLines={3}
                  >
                    {verse.text}
                  </Text>
                  <View style={styles.verseFooter}>
                    <Text
                      style={[
                        styles.masteryLabel,
                        { color: getLevelColor(verse.level) },
                      ]}
                    >
                      {verse.level}
                    </Text>
                    {verse.accuracy !== undefined && verse.accuracy > 0 && (
                      <Text
                        style={[
                          styles.accuracyText,
                          { color: textColor + "80" },
                        ]}
                      >
                        {verse.accuracy}% accuracy
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleReview(verse)}
                  >
                    <View
                      style={[
                        styles.reviewButtonInner,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.reviewButtonText}>Practice</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {verses.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="book-open-outline"
                size={64}
                color={textColor + "40"}
              />
              <Text style={[styles.emptyText, { color: textColor + "80" }]}>
                No verses yet. Add your first verse to start memorizing!
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Review Mode
        <KeyboardAvoidingView
          style={styles.reviewContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.reviewHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsReviewing(false);
                setSelectedVerse(null);
                setScrambledOrder([]);
                setProgressiveStage(0);
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
            <View style={styles.reviewHeaderCenter}>
              <Text style={[styles.reviewTitle, { color: textColor }]}>
                {selectedVerse?.currentExercise?.type === "fill-blank" &&
                  "Fill in Blanks"}
                {selectedVerse?.currentExercise?.type === "first-letter" &&
                  "First Letters"}
                {selectedVerse?.currentExercise?.type === "word-scramble" &&
                  "Word Scramble"}
                {selectedVerse?.currentExercise?.type === "progressive" &&
                  "Progressive Reveal"}
                {selectedVerse?.currentExercise?.type === "typing" &&
                  "Type Full Verse"}
              </Text>
              {hintsUsed > 0 && (
                <Text style={[styles.hintsText, { color: textColor + "80" }]}>
                  {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleUseHint}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={28}
                color={showAnswer ? colors.warning : textColor}
              />
            </TouchableOpacity>
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
                {/* Progressive Reveal */}
                {selectedVerse.currentExercise.type === "progressive" &&
                  selectedVerse.currentExercise.stages && (
                    <View>
                      <Text
                        style={[styles.exercisePrompt, { color: textColor }]}
                      >
                        {selectedVerse.currentExercise.stages[progressiveStage]}
                      </Text>
                      <TouchableOpacity
                        style={styles.revealButton}
                        onPress={handleProgressiveReveal}
                        disabled={
                          progressiveStage >=
                          selectedVerse.currentExercise.stages.length - 1
                        }
                      >
                        <Text style={styles.revealButtonText}>
                          {progressiveStage >=
                          selectedVerse.currentExercise.stages.length - 1
                            ? "Fully Revealed"
                            : "Reveal More"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                {/* Word Scramble */}
                {selectedVerse.currentExercise.type === "word-scramble" && (
                  <View>
                    <Text
                      style={[
                        styles.scramblePrompt,
                        { color: textColor + "D0" },
                      ]}
                    >
                      {selectedVerse.currentExercise.prompt}
                    </Text>
                    {userAnswer.length > 0 && (
                      <View
                        style={[
                          styles.reviewButtonInner,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[styles.userAnswerText, { color: textColor }]}
                        >
                          {userAnswer}
                        </Text>
                      </View>
                    )}
                    <View style={styles.scrambleWordsContainer}>
                      {scrambledOrder.map((word, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.scrambleWord,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={() => handleWordTap(word, index)}
                        >
                          <Text style={styles.scrambleWordText}>{word}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={resetScramble}
                    >
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Other Exercise Types */}
                {selectedVerse.currentExercise.type !== "progressive" &&
                  selectedVerse.currentExercise.type !== "word-scramble" && (
                    <>
                      <Text
                        style={[
                          styles.exercisePrompt,
                          { color: textColor + "D0" },
                        ]}
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
                        placeholder={
                          selectedVerse.currentExercise.type === "typing"
                            ? "Type the full verse..."
                            : selectedVerse.currentExercise.type ===
                                "first-letter"
                              ? "Type the full verse from the letters..."
                              : "Type the missing words..."
                        }
                        placeholderTextColor={textColor + "50"}
                        value={userAnswer}
                        onChangeText={setUserAnswer}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </>
                  )}

                {showAnswer && (
                  <View
                    style={[styles.answerCard, { backgroundColor: cardBg }]}
                  >
                    <Text
                      style={[styles.answerLabel, { color: textColor + "80" }]}
                    >
                      Answer:
                    </Text>
                    <Text style={[styles.answerText, { color: textColor }]}>
                      {typeof selectedVerse.currentExercise.answer === "string"
                        ? selectedVerse.currentExercise.answer
                        : selectedVerse.currentExercise.answer.join(" ")}
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
                  <Text style={styles.ratingButtonText}>Forgot It</Text>
                  <Text style={styles.ratingSubtext}>Start over</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.ratingHard]}
                  onPress={() => handleSubmitReview(2)}
                >
                  <Text style={styles.ratingButtonText}>Hard</Text>
                  <Text style={styles.ratingSubtext}>Struggled</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.ratingGood]}
                  onPress={() => handleSubmitReview(4)}
                >
                  <Text style={styles.ratingButtonText}>Good</Text>
                  <Text style={styles.ratingSubtext}>Got it!</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.ratingPerfect]}
                  onPress={() => handleSubmitReview(5)}
                >
                  <Text style={styles.ratingButtonText}>Perfect</Text>
                  <Text style={styles.ratingSubtext}>Easy recall</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Add Verse Modal */}
      <Modal
        visible={showAddVerse}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddVerse(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddVerse(false)}>
              <Text style={[styles.modalCancel, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Add Verse
            </Text>
            <TouchableOpacity onPress={handleAddVerse}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={[styles.inputLabel, { color: textColor }]}>
              Verse Reference
            </Text>
            <View style={styles.referenceInputContainer}>
              <TextInput
                style={[
                  styles.referenceInput,
                  { backgroundColor: cardBg, color: textColor },
                ]}
                placeholder="e.g., John 3:16"
                placeholderTextColor={textColor + "50"}
                value={newVerseRef}
                onChangeText={setNewVerseRef}
              />
              <TouchableOpacity
                style={styles.lookupButton}
                onPress={handleLookupVerse}
                disabled={isLoadingVerse}
              >
                {isLoadingVerse ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <MaterialCommunityIcons
                    name="magnify"
                    size={24}
                    color={colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: textColor }]}>
              Verse Text
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: cardBg, color: textColor },
              ]}
              placeholder="Enter the verse text..."
              placeholderTextColor={textColor + "50"}
              value={newVerseText}
              onChangeText={setNewVerseText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={showStats}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStats(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <View style={styles.spacer} />
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Statistics
            </Text>
            <TouchableOpacity onPress={() => setShowStats(false)}>
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: colors.primary }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Total Verses
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: colors.error }]}>
                  {stats.learning}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Learning
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: colors.warning }]}>
                  {stats.young}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Young
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text
                  style={[styles.statBoxNumber, { color: colors.primaryLight }]}
                >
                  {stats.mature}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Mature
                </Text>
              </View>
            </View>

            <View style={[styles.progressSection, { backgroundColor: cardBg }]}>
              <Text style={[styles.progressTitle, { color: textColor }]}>
                Today&apos;s Progress
              </Text>
              <Text style={[styles.progressStat, { color: textColor }]}>
                {analytics.versesReviewedToday} verses reviewed
              </Text>
              <Text style={[styles.progressStat, { color: textColor }]}>
                {analytics.totalTimeSpent} minutes spent
              </Text>
              <Text style={[styles.progressStat, { color: textColor }]}>
                {analytics.averageAccuracy}% average accuracy
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievements}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAchievements(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <View style={styles.spacer} />
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Achievements
            </Text>
            <TouchableOpacity onPress={() => setShowAchievements(false)}>
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: cardBg },
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: textColor }]}>
                    {achievement.title}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      { color: textColor + "80" },
                    ]}
                  >
                    {achievement.description}
                  </Text>
                  {!achievement.unlocked && (
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${achievement.progress * 100}%` },
                        ]}
                      />
                    </View>
                  )}
                </View>
                {achievement.unlocked && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={32}
                    color={colors.success}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  accuracyText: {
    fontSize: fontSize.sm,
  },
  achievementCard: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  achievementIcon: {
    fontSize: fontSize.xxxl + 16,
    marginRight: spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 56,
  },
  answerCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  answerInput: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.xl,
    minHeight: 120,
    padding: spacing.md,
  },
  answerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  answerText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  exercisePrompt: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: fontSize.lg,
    lineHeight: 28,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  exerciseTypeButton: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    minWidth: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  exerciseTypeContainer: {
    paddingVertical: spacing.sm,
  },
  exerciseTypeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  hintsText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  lookupButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    height: 50,
    justifyContent: "center",
    marginLeft: spacing.sm,
    width: 50,
  },
  masteryLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  modalCancel: {
    fontSize: fontSize.lg,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalDone: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: colors.black + "20",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalScrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  progressBar: {
    backgroundColor: colors.black + "20",
    borderRadius: borderRadius.sm,
    height: 8,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: "100%",
  },
  progressSection: {
    borderRadius: borderRadius.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  progressStat: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  ratingButton: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    minHeight: 64,
    paddingVertical: spacing.md,
  },
  ratingButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  ratingButtons: {
    gap: spacing.md,
  },
  ratingFailed: {
    backgroundColor: colors.error,
  },
  ratingGood: {
    backgroundColor: colors.success,
  },
  ratingHard: {
    backgroundColor: colors.warning,
  },
  ratingPerfect: {
    backgroundColor: colors.purple,
  },
  ratingSection: {
    marginTop: spacing.xl,
  },
  ratingSubtext: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  ratingTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  referenceInput: {
    borderRadius: borderRadius.xl,
    flex: 1,
    fontSize: fontSize.lg,
    height: 50,
    paddingHorizontal: spacing.md,
  },
  referenceInputContainer: {
    flexDirection: "row",
  },
  resetButton: {
    alignItems: "center",
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  resetButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  revealButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  revealButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  reviewButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  reviewButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  reviewContainer: {
    flex: 1,
  },
  reviewContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  reviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reviewHeaderCenter: {
    alignItems: "center",
    flex: 1,
  },
  reviewReference: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  reviewScrollView: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  scramblePrompt: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  scrambleWord: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  scrambleWordText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  scrambleWordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  spacer: {
    width: 60,
  },
  statBox: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flex: 1,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
  },
  statBoxLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statBoxNumber: {
    fontSize: fontSize.xxxl + 4,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statCard: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flex: 1,
    justifyContent: "center",
    minHeight: 100,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  statNumber: {
    color: colors.text.inverse,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  streakCard: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  streakInfo: {
    marginLeft: spacing.md,
  },
  streakLabel: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  streakNumber: {
    color: colors.text.inverse,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  textInput: {
    borderRadius: borderRadius.xl,
    fontSize: fontSize.lg,
    minHeight: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: "top",
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },

  userAnswerText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  verseCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  verseFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  verseHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  verseReference: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  verseText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
