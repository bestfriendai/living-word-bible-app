import { Stack } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { geminiService } from "@/services/geminiService";
import { useSpeechToText } from "@/utils/speechToText";

// Color constants
const COLOR_WHITE = "#fff";
const COLOR_PURPLE = "#a855f7";
const COLOR_GREEN = "#10b981";
const COLOR_PINK = "#ec4899";

export default function Journal() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState("");
  const [newPrayerContent, setNewPrayerContent] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSituation, setAISituation] = useState("");
  const [generatedPrayer, setGeneratedPrayer] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const journalEntries = useBibleStore((state) => state.journalEntries);
  const addJournalEntry = useBibleStore((state) => state.addJournalEntry);
  const deleteJournalEntry = useBibleStore((state) => state.deleteJournalEntry);

  // Speech-to-text for prayer dictation
  const { isListening, startListening, stopListening, resetTranscript } =
    useSpeechToText({
      onResult: (text, isFinal) => {
        if (isFinal) {
          setNewPrayerContent((prev) => (prev ? prev + " " + text : text));
          stopListening();
        }
      },
    });

  const handleAddPrayer = useCallback(() => {
    if (newPrayerTitle.trim() && newPrayerContent.trim()) {
      addJournalEntry({
        title: newPrayerTitle,
        content: newPrayerContent,
      });
      setNewPrayerTitle("");
      setNewPrayerContent("");
      setShowAddModal(false);
    } else {
      Alert.alert("Required", "Please enter both a title and your prayer.");
    }
  }, [newPrayerTitle, newPrayerContent, addJournalEntry]);

  const handleDeletePrayer = useCallback(
    (id: string, title: string) => {
      if (Platform.OS === "web") {
        if (confirm(`Delete "${title}"?`)) {
          deleteJournalEntry(id);
        }
      } else {
        Alert.alert(
          "Delete Prayer",
          `Are you sure you want to delete "${title}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteJournalEntry(id),
            },
          ],
        );
      }
    },
    [deleteJournalEntry],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleGeneratePrayer = async () => {
    if (!aiSituation.trim()) {
      Alert.alert("Required", "Please describe your situation.");
      return;
    }

    setIsGenerating(true);
    try {
      const prayer = await geminiService.generatePrayer(aiSituation);
      setGeneratedPrayer(prayer);
    } catch (error) {
      Alert.alert("Error", "Failed to generate prayer. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedPrayer = () => {
    if (generatedPrayer) {
      addJournalEntry({
        title: generatedPrayer.title,
        content: generatedPrayer.prayer,
        category: generatedPrayer.category,
      });
      setShowAIModal(false);
      setAISituation("");
      setGeneratedPrayer(null);
      Alert.alert("Saved", "Prayer has been saved to your journal!");
    }
  };

  const handleResetAI = () => {
    setAISituation("");
    setGeneratedPrayer(null);
  };

  const handleLoadInsights = async () => {
    if (journalEntries.length === 0) return;

    setShowInsights(true);
    setIsLoadingInsights(true);

    try {
      const prayerInsights =
        await geminiService.analyzePrayerJournal(journalEntries);
      setInsights(prayerInsights);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      await stopListening();
    } else {
      resetTranscript();
      await startListening();
    }
  };

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
          <View>
            <Text style={[styles.subtitle, { color: textColor + "90" }]}>
              Prayer tracker
            </Text>
            <Text style={[styles.title, { color: textColor }]}>Journal</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => setShowAIModal(true)}
            >
              <MaterialCommunityIcons
                name="auto-fix"
                size={28}
                color={COLOR_WHITE}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.color.reactBlue.dark },
              ]}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={32}
                color={COLOR_WHITE}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Insights Card */}
        {journalEntries.length >= 3 && (
          <TouchableOpacity
            style={styles.insightsCard}
            onPress={handleLoadInsights}
          >
            <View style={styles.insightsPlainCard}>
              <View style={styles.insightsContent}>
                <MaterialCommunityIcons
                  name="chart-arc"
                  size={40}
                  color={COLOR_WHITE}
                />
                <View style={styles.insightsTextContainer}>
                  <Text style={styles.insightsTitle}>Prayer Insights</Text>
                  <Text style={styles.insightsSubtitle}>
                    View analysis of your prayers
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={28}
                color={COLOR_WHITE}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Journal Entries */}
        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={64}
                color={COLOR_PURPLE}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Begin Your Journal
            </Text>
            <Text style={[styles.emptySubtitle, { color: textColor + "70" }]}>
              Document your prayers and witness God&apos;s faithfulness
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add First Prayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            {journalEntries.map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(index * 50)}
              >
                <View style={[styles.entryCard, { backgroundColor: cardBg }]}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryHeaderLeft}>
                      <Text style={[styles.entryTitle, { color: textColor }]}>
                        {entry.title}
                      </Text>
                      <Text
                        style={[styles.entryDate, { color: textColor + "70" }]}
                      >
                        {formatDate(entry.createdAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePrayer(entry.id, entry.title)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={28}
                        color={textColor + "70"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[styles.entryContent, { color: textColor + "D0" }]}
                    numberOfLines={3}
                  >
                    {entry.content}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Prayer Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalHeaderButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={32}
                color={textColor}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              New Prayer
            </Text>
            <TouchableOpacity
              onPress={handleAddPrayer}
              style={styles.modalHeaderButton}
            >
              <Text
                style={[
                  styles.saveButton,
                  { color: theme.color.reactBlue.dark },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: textColor,
                  borderColor: cardBg,
                  backgroundColor: cardBg,
                },
              ]}
              placeholder="Prayer Title"
              placeholderTextColor={textColor + "50"}
              value={newPrayerTitle}
              onChangeText={setNewPrayerTitle}
            />

            <View style={styles.contentInputContainer}>
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    color: textColor,
                    borderColor: cardBg,
                    backgroundColor: cardBg,
                  },
                ]}
                placeholder="Write your prayer here..."
                placeholderTextColor={textColor + "50"}
                value={newPrayerContent}
                onChangeText={setNewPrayerContent}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive,
                  {
                    backgroundColor: isListening ? "#ef4444" : cardBg,
                    borderColor: isListening ? "#ef4444" : textColor + "30",
                  },
                ]}
                onPress={handleVoiceInput}
              >
                <MaterialCommunityIcons
                  name={isListening ? "stop" : "microphone"}
                  size={24}
                  color={isListening ? "#fff" : textColor}
                />
              </TouchableOpacity>
            </View>

            {isListening && (
              <View style={styles.listeningIndicator}>
                <MaterialCommunityIcons
                  name="microphone"
                  size={16}
                  color="#ef4444"
                />
                <Text style={[styles.listeningText, { color: textColor }]}>
                  Listening... speak your prayer
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* AI Prayer Generator Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity
              onPress={() => {
                setShowAIModal(false);
                handleResetAI();
              }}
              style={styles.modalHeaderButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={32}
                color={textColor}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              AI Prayer
            </Text>
            {generatedPrayer ? (
              <TouchableOpacity
                onPress={handleSaveGeneratedPrayer}
                style={styles.modalHeaderButton}
              >
                <Text style={[styles.saveButton, { color: COLOR_PURPLE }]}>
                  Save
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyHeaderSpace} />
            )}
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {!generatedPrayer ? (
              <>
                <View style={styles.aiHeader}>
                  <View style={styles.aiIconPlain}>
                    <MaterialCommunityIcons
                      name="auto-fix"
                      size={40}
                      color={COLOR_WHITE}
                    />
                  </View>
                  <Text style={[styles.aiTitle, { color: textColor }]}>
                    AI Prayer Generator
                  </Text>
                  <Text
                    style={[styles.aiSubtitle, { color: textColor + "70" }]}
                  >
                    Describe your situation and AI will help you pray
                  </Text>
                </View>

                <TextInput
                  style={[
                    styles.aiInput,
                    {
                      color: textColor,
                      borderColor: cardBg,
                      backgroundColor: cardBg,
                    },
                  ]}
                  placeholder="What's on your heart? (e.g., 'I'm feeling anxious about my job interview')"
                  placeholderTextColor={textColor + "50"}
                  value={aiSituation}
                  onChangeText={setAISituation}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isGenerating && styles.generateButtonDisabled,
                    isGenerating
                      ? styles.generateButtonDisabledBg
                      : styles.generateButtonEnabledBg,
                  ]}
                  onPress={handleGeneratePrayer}
                  disabled={isGenerating}
                >
                  <View style={styles.generateButtonContent}>
                    {isGenerating ? (
                      <ActivityIndicator color={COLOR_WHITE} size="large" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="auto-fix"
                          size={24}
                          color={COLOR_WHITE}
                        />
                        <Text style={styles.generateButtonText}>
                          Generate Prayer
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={[styles.prayerResult, { backgroundColor: cardBg }]}
                >
                  <View style={styles.prayerBadge}>
                    <Text style={styles.prayerBadgeText}>
                      {generatedPrayer.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.prayerTitle, { color: textColor }]}>
                    {generatedPrayer.title}
                  </Text>
                  <Text
                    style={[styles.prayerText, { color: textColor + "D0" }]}
                  >
                    {generatedPrayer.prayer}
                  </Text>
                  {generatedPrayer.suggestedVerses &&
                    generatedPrayer.suggestedVerses.length > 0 && (
                      <View style={styles.versesSection}>
                        <Text
                          style={[
                            styles.versesSectionTitle,
                            { color: textColor },
                          ]}
                        >
                          Suggested Verses
                        </Text>
                        {generatedPrayer.suggestedVerses.map(
                          (verse: string, idx: number) => (
                            <View key={idx} style={styles.verseTag}>
                              <MaterialCommunityIcons
                                name="book-open-variant"
                                size={14}
                                color={COLOR_PURPLE}
                              />
                              <Text style={styles.verseTagText}>{verse}</Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}
                </View>

                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleResetAI}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={24}
                    color={textColor + "70"}
                  />
                  <Text
                    style={[
                      styles.regenerateButtonText,
                      { color: textColor + "70" },
                    ]}
                  >
                    Generate Another Prayer
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Prayer Insights Modal */}
      <Modal
        visible={showInsights}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsights(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity
              onPress={() => setShowInsights(false)}
              style={styles.modalHeaderButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={32}
                color={textColor}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Prayer Insights
            </Text>
            <View style={styles.emptyHeaderSpace} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {isLoadingInsights ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR_GREEN} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Analyzing your prayers...
                </Text>
              </View>
            ) : insights ? (
              <>
                <View style={styles.insightStatsRow}>
                  <View style={[styles.statCard, styles.statCardBlue]}>
                    <Text style={styles.statNumber}>
                      {insights.totalPrayers}
                    </Text>
                    <Text style={styles.statLabel}>Total Prayers</Text>
                  </View>

                  <View style={[styles.statCard, styles.statCardGreen]}>
                    <Text style={styles.statNumber}>
                      {insights.answeredPrayers}
                    </Text>
                    <Text style={styles.statLabel}>Answered</Text>
                  </View>
                </View>

                {insights.commonThemes &&
                  insights.commonThemes.length > 0 &&
                  insights.commonThemes.slice(0, 3).length > 0 && (
                    <View
                      style={[
                        styles.insightSection,
                        { backgroundColor: cardBg },
                      ]}
                    >
                      <View style={styles.insightHeader}>
                        <MaterialCommunityIcons
                          name="tag-multiple"
                          size={28}
                          color={COLOR_PURPLE}
                        />
                        <Text
                          style={[styles.insightTitle, { color: textColor }]}
                        >
                          Top Prayer Themes
                        </Text>
                      </View>
                      <View style={styles.themesList}>
                        {insights.commonThemes
                          .slice(0, 3)
                          .map((theme: string, idx: number) => (
                            <View key={idx} style={styles.themeTag}>
                              <Text style={styles.themeText}>{theme}</Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                {insights.encouragement && (
                  <View
                    style={[styles.insightSection, { backgroundColor: cardBg }]}
                  >
                    <View style={styles.insightHeader}>
                      <MaterialCommunityIcons
                        name="heart"
                        size={28}
                        color={COLOR_PINK}
                      />
                      <Text style={[styles.insightTitle, { color: textColor }]}>
                        Encouragement
                      </Text>
                    </View>
                    <Text
                      style={[styles.insightText, { color: textColor + "D0" }]}
                    >
                      {insights.encouragement}
                    </Text>
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  aiButton: {
    alignItems: "center",
    backgroundColor: COLOR_PURPLE,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  aiHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  aiIconPlain: {
    alignItems: "center",
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    marginBottom: 20,
    width: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  aiInput: {
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 24,
    minHeight: 180,
    padding: 20,
    textAlignVertical: "top",
  },
  aiSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 320,
    textAlign: "center",
  },
  aiTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  container: {
    flex: 1,
  },
  contentInput: {
    borderRadius: 12,
    fontSize: 18,
    minHeight: 250,
    padding: 20,
    paddingRight: 70,
    textAlignVertical: "top",
  },
  contentInputContainer: {
    position: "relative",
  },
  deleteButton: {
    padding: 12,
  },
  emptyButton: {
    backgroundColor: "#a855f7",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHeaderSpace: {
    width: 60,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 60,
    height: 120,
    justifyContent: "center",
    marginBottom: 24,
    width: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptySubtitle: {
    fontSize: 16,
    marginBottom: 24,
    maxWidth: 280,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  entriesContainer: {
    gap: 24,
  },
  entryCard: {
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  entryContent: {
    fontSize: 18,
    lineHeight: 28,
  },
  entryDate: {
    fontSize: 16,
  },
  entryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  entryHeaderLeft: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  generateButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  generateButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonDisabledBg: {
    backgroundColor: "#a855f780",
  },
  generateButtonEnabledBg: {
    backgroundColor: "#a855f7",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  insightSection: {
    borderRadius: 16,
    marginBottom: 24,
    padding: 24,
  },
  insightStatsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 28,
  },
  insightText: {
    fontSize: 18,
    lineHeight: 28,
  },
  insightTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  insightsCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  insightsContent: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 20,
  },
  insightsPlainCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 80,
    padding: 24,
  },
  insightsSubtitle: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 22,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  listeningIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  listeningText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
  },
  micButton: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 20,
    width: 56,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  micButtonActive: {
    ...Platform.select({
      ios: {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 60,
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  prayerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#a855f7",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  prayerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  prayerResult: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 24,
  },
  prayerText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  prayerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  regenerateButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: 20,
  },
  regenerateButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  statCard: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 120,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statCardBlue: {
    backgroundColor: "#3b82f6",
  },
  statCardGreen: {
    backgroundColor: "#10b981",
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  statNumber: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  themeTag: {
    borderRadius: 12,
    marginBottom: 12,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  themesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  titleInput: {
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    minHeight: 56,
    padding: 20,
  },
  verseTag: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verseTagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  versesSection: {
    marginTop: 8,
  },
  versesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
