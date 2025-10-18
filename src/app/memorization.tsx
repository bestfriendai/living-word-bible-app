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
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  memorizationService,
  MemorizedVerse,
} from "@/services/memorizationService";
import { bibleApiService } from "@/services/bibleApiService";

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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddVerse(true)}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Streak Display */}
          {streak.currentStreak > 0 && (
            <View style={[styles.streakCard, { backgroundColor: "#ff6b6b" }]}>
              <MaterialCommunityIcons name="fire" size={32} color="#fff" />
              <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
                <Text style={styles.streakLabel}>Day Streak!</Text>
              </View>
            </View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: "#10b981" }]}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statNumber}>
                {verses.filter((v) => v.level === "Mastered").length}
              </Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: "#f59e0b" }]}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statNumber}>{versesDueForReview.length}</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: "#a855f7" }]}
              onPress={() => setShowAchievements(true)}
            >
              <MaterialCommunityIcons name="trophy" size={32} color="#fff" />
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
                        exerciseType === type.type ? "#667eea" : cardBg,
                    },
                  ]}
                  onPress={() => setExerciseType(type.type)}
                >
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={24}
                    color={exerciseType === type.type ? "#fff" : textColor}
                  />
                  <Text
                    style={[
                      styles.exerciseTypeLabel,
                      {
                        color: exerciseType === type.type ? "#fff" : textColor,
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
                        { backgroundColor: "#667eea" },
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
                color={showAnswer ? "#f59e0b" : textColor}
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
                          styles.userAnswerBox,
                          { backgroundColor: cardBg },
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
                            { backgroundColor: "#667eea" },
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MaterialCommunityIcons
                    name="magnify"
                    size={24}
                    color="#fff"
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
            <View style={{ width: 60 }} />
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
                <Text style={[styles.statBoxNumber, { color: "#667eea" }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Total Verses
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: "#ef4444" }]}>
                  {stats.learning}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Learning
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: "#f59e0b" }]}>
                  {stats.young}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Young
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: cardBg }]}>
                <Text style={[styles.statBoxNumber, { color: "#3b82f6" }]}>
                  {stats.mature}
                </Text>
                <Text style={[styles.statBoxLabel, { color: textColor }]}>
                  Mature
                </Text>
              </View>
            </View>

            <View style={[styles.progressSection, { backgroundColor: cardBg }]}>
              <Text style={[styles.progressTitle, { color: textColor }]}>
                Today's Progress
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
            <View style={{ width: 60 }} />
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
                  {
                    backgroundColor: cardBg,
                    opacity: achievement.unlocked ? 1 : 0.5,
                  },
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
                    color="#10b981"
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
    fontSize: 14,
  },
  achievementCard: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    marginBottom: 16,
    padding: 20,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
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
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  answerText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 16,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  exercisePrompt: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
    textAlign: "center",
  },
  exerciseTypeButton: {
    alignItems: "center",
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exerciseTypeContainer: {
    paddingVertical: 8,
  },
  exerciseTypeLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  hintsText: {
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  lookupButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    marginLeft: 8,
    width: 50,
  },
  masteryLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalCancel: {
    fontSize: 17,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalDone: {
    color: "#667eea",
    fontSize: 17,
    fontWeight: "600",
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: "#00000020",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalScrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    backgroundColor: "#00000020",
    borderRadius: 4,
    height: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#667eea",
    height: "100%",
  },
  progressSection: {
    borderRadius: 16,
    marginTop: 24,
    padding: 20,
  },
  progressStat: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  ratingButton: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 64,
    paddingVertical: 12,
  },
  ratingButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  ratingButtons: {
    gap: 12,
  },
  ratingFailed: {
    backgroundColor: "#ef4444",
  },
  ratingGood: {
    backgroundColor: "#10b981",
  },
  ratingHard: {
    backgroundColor: "#f59e0b",
  },
  ratingPerfect: {
    backgroundColor: "#8b5cf6",
  },
  ratingSection: {
    marginTop: 24,
  },
  ratingSubtext: {
    color: "#fff",
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  referenceInput: {
    borderRadius: 12,
    flex: 1,
    fontSize: 17,
    height: 50,
    paddingHorizontal: 16,
  },
  referenceInputContainer: {
    flexDirection: "row",
  },
  resetButton: {
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  revealButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 16,
  },
  revealButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
  reviewHeaderCenter: {
    alignItems: "center",
    flex: 1,
  },
  reviewReference: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  reviewScrollView: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scramblePrompt: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  scrambleWord: {
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scrambleWordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrambleWordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
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
    fontWeight: "700",
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    marginBottom: 16,
    paddingVertical: 20,
  },
  statBoxLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statBoxNumber: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 4,
  },
  statCard: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 100,
    padding: 16,
  },
  statLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  statNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  streakCard: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    marginBottom: 24,
    padding: 20,
  },
  streakInfo: {
    marginLeft: 16,
  },
  streakLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  streakNumber: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
  },
  textInput: {
    borderRadius: 12,
    fontSize: 17,
    minHeight: 150,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  userAnswerBox: {
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 60,
    padding: 16,
  },
  userAnswerText: {
    fontSize: 16,
    lineHeight: 24,
  },
  verseCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  verseFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  verseHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: "700",
  },
  verseText: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
