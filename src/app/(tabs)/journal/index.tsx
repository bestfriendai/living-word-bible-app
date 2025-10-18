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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { geminiService } from "@/services/geminiService";
import { useSpeechToText } from "@/utils/speechToText";
import { socialSharingService } from "@/services/socialSharingService";
import { colors } from "@/theme/colors";

export default function Journal() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
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

  const handleShareJournalEntry = async (entry: any) => {
    try {
      await socialSharingService.shareJournalEntry(
        entry.title,
        entry.content,
        entry.category,
        entry.isAnswered,
      );
    } catch (error) {
      console.error("Error sharing journal entry:", error);
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
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTextSection}>
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              Prayer tracker
            </Text>
            <Text style={[styles.title, { color: textColor }]}>Journal</Text>
            <Text style={[styles.headerDescription, { color: textSecondary }]}>
              Document your spiritual journey
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: cardBg }]}
              onPress={() => setShowAIModal(true)}
            >
              <MaterialCommunityIcons
                name="auto-fix"
                size={24}
                color={colors.secondary}
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
                size={28}
                color={colors.text.inverse}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Prayer Insights Card */}
        {journalEntries.length >= 3 && (
          <TouchableOpacity
            style={styles.insightsCard}
            onPress={handleLoadInsights}
          >
            <LinearGradient
              colors={[colors.secondary, colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.insightsPlainCard}
            >
              <View style={styles.insightsContent}>
                <View style={styles.insightsIcon}>
                  <MaterialCommunityIcons
                    name="chart-arc"
                    size={32}
                    color={colors.text.inverse}
                  />
                </View>
                <View style={styles.insightsTextContainer}>
                  <Text style={styles.insightsTitle}>Prayer Insights</Text>
                  <Text style={styles.insightsSubtitle}>
                    View analysis of your {journalEntries.length} prayers
                  </Text>
                  <View style={styles.insightsStats}>
                    <View style={styles.insightStat}>
                      <Text style={styles.insightStatNumber}>
                        {journalEntries.length}
                      </Text>
                      <Text style={styles.insightStatLabel}>Total</Text>
                    </View>
                    <View style={styles.insightStat}>
                      <Text style={styles.insightStatNumber}>
                        {Math.floor(journalEntries.length * 0.7)}
                      </Text>
                      <Text style={styles.insightStatLabel}>This Month</Text>
                    </View>
                  </View>
                </View>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color={colors.text.inverseLight}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Enhanced Journal Entries */}
        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={64}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Begin Your Journal
            </Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
              Document your prayers and witness God&apos;s faithfulness
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={colors.text.inverse}
              />
              <Text style={styles.emptyButtonText}>Add First Prayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            <View style={styles.entriesHeader}>
              <Text style={[styles.entriesTitle, { color: textColor }]}>
                Your Prayers
              </Text>
              <Text style={[styles.entriesCount, { color: textSecondary }]}>
                {journalEntries.length} entries
              </Text>
            </View>
            {journalEntries.map((entry, index) => (
              <View
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: cardBg }]}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    <View style={styles.entryIcon}>
                      <MaterialCommunityIcons
                        name="hand-heart"
                        size={20}
                        color={colors.secondary}
                      />
                    </View>
                    <View style={styles.entryTitleSection}>
                      <Text style={[styles.entryTitle, { color: textColor }]}>
                        {entry.title}
                      </Text>
                      <Text
                        style={[styles.entryDate, { color: textSecondary }]}
                      >
                        {formatDate(entry.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.entryHeaderRight}>
                    <TouchableOpacity
                      onPress={() => handleShareJournalEntry(entry)}
                      style={styles.entryActionButton}
                    >
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={20}
                        color={textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePrayer(entry.id, entry.title)}
                      style={styles.entryActionButton}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={[styles.entryContent, { color: textColor + "D0" }]}
                  numberOfLines={3}
                >
                  {entry.content}
                </Text>
                {entry.category && (
                  <View style={styles.entryCategory}>
                    <Text style={styles.entryCategoryText}>
                      {entry.category}
                    </Text>
                  </View>
                )}
              </View>
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
                    backgroundColor: isListening ? colors.error : cardBg,
                    borderColor: isListening ? colors.error : textColor + "30",
                  },
                ]}
                onPress={handleVoiceInput}
              >
                <MaterialCommunityIcons
                  name={isListening ? "stop" : "microphone"}
                  size={24}
                  color={isListening ? colors.text.inverse : textColor}
                />
              </TouchableOpacity>
            </View>

            {isListening && (
              <View style={styles.listeningIndicator}>
                <MaterialCommunityIcons
                  name="microphone"
                  size={16}
                  color={colors.error}
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
                <Text style={[styles.saveButton, { color: colors.secondary }]}>
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
                      color={colors.text.inverse}
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
                      <ActivityIndicator
                        color={colors.text.inverse}
                        size="large"
                      />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="auto-fix"
                          size={24}
                          color={colors.text.inverse}
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
                                color={colors.secondary}
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
                <ActivityIndicator size="large" color={colors.success} />
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
                          color={colors.secondary}
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
                        color={colors.accentPink}
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
    borderRadius: appleDesign.borderRadius.round,
    height: 56,
    justifyContent: "center",
    width: 56,
    ...appleDesign.shadows.md,
  },

  aiHeader: {
    alignItems: "center",
    marginBottom: appleDesign.spacing.xxxl,
  },
  aiIconPlain: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.round,
    height: 100,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.xl,
    width: 100,
    ...appleDesign.shadows.md,
  },
  aiInput: {
    borderRadius: appleDesign.borderRadius.lg,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    marginBottom: appleDesign.spacing.xxl,
    minHeight: 180,
    padding: appleDesign.spacing.xl,
    textAlignVertical: "top",
  },
  aiSubtitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    maxWidth: 320,
    textAlign: "center",
  },
  aiTitle: {
    fontSize: appleDesign.typography.fontSize.largeTitle,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    lineHeight: appleDesign.typography.lineHeight.largeTitle,
    marginBottom: appleDesign.spacing.sm,
  },
  container: {
    flex: 1,
  },
  contentInput: {
    borderRadius: appleDesign.borderRadius.lg,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    minHeight: 250,
    padding: appleDesign.spacing.xl,
    paddingRight: 70,
    textAlignVertical: "top",
  },
  contentInputContainer: {
    position: "relative",
  },

  emptyButton: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: appleDesign.borderRadius.lg,
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    paddingHorizontal: appleDesign.spacing.xl,
    paddingVertical: appleDesign.spacing.md,
    ...appleDesign.shadows.sm,
  },
  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  emptyHeaderSpace: {
    width: 60,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.secondary + "20",
    borderRadius: appleDesign.borderRadius.round,
    height: 120,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.xxl,
    width: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptySubtitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.xxl,
    maxWidth: 280,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: appleDesign.typography.fontSize.title1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title1,
    marginBottom: appleDesign.spacing.sm,
  },
  entriesContainer: {
    gap: appleDesign.spacing.xxl,
  },
  entriesCount: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  entriesHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.lg,
  },
  entriesTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  entryActionButton: {
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: appleDesign.borderRadius.md,
    height: 36,
    justifyContent: "center",
    marginLeft: appleDesign.spacing.sm,
    width: 36,
  },
  entryCard: {
    borderRadius: appleDesign.borderRadius.lg,
    padding: appleDesign.spacing.xl,
    ...appleDesign.shadows.sm,
  },
  entryCategory: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryLight + "30",
    borderRadius: appleDesign.borderRadius.sm,
    marginTop: appleDesign.spacing.md,
    paddingHorizontal: appleDesign.spacing.sm,
    paddingVertical: appleDesign.spacing.xs,
  },
  entryCategoryText: {
    color: colors.secondary,
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.caption1,
  },
  entryContent: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 30,
    marginTop: appleDesign.spacing.md,
  },
  entryDate: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.caption1,
    marginTop: appleDesign.spacing.xs,
  },
  entryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.lg,
  },
  entryHeaderLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: appleDesign.spacing.md,
  },
  entryHeaderRight: {
    alignItems: "center",
    flexDirection: "row",
  },
  entryIcon: {
    alignItems: "center",
    backgroundColor: colors.secondary + "20",
    borderRadius: appleDesign.borderRadius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  entryTitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  entryTitleSection: {
    flex: 1,
  },
  generateButton: {
    borderRadius: appleDesign.borderRadius.lg,
    overflow: "hidden",
    ...appleDesign.shadows.md,
  },
  generateButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: appleDesign.spacing.xxxl,
    paddingVertical: appleDesign.spacing.lg,
  },
  generateButtonDisabled: {
    opacity: appleDesign.opacity.medium,
  },
  generateButtonDisabledBg: {
    backgroundColor: colors.secondaryLight80,
  },
  generateButtonEnabledBg: {
    backgroundColor: colors.secondary,
  },
  generateButtonText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.xxxl,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...appleDesign.shadows.sm,
  },
  headerButtons: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
  },
  headerDescription: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.xs,
  },
  headerTextSection: {
    flex: 1,
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.lg,
    marginBottom: appleDesign.spacing.lg,
  },
  insightSection: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.xxl,
  },
  insightStat: {
    alignItems: "center",
  },
  insightStatLabel: {
    color: colors.text.inverseSecondary,
    fontSize: appleDesign.typography.fontSize.caption2,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.caption2,
  },
  insightStatNumber: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  insightStatsRow: {
    flexDirection: "row",
    gap: appleDesign.spacing.xl,
    marginBottom: appleDesign.spacing.xxxl,
  },
  insightText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 30,
  },
  insightTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  insightsCard: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xxl,
    overflow: "hidden",
    ...appleDesign.shadows.md,
  },
  insightsContent: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: appleDesign.spacing.xxl,
  },

  insightsIcon: {
    alignItems: "center",
    backgroundColor: colors.background.overlay,
    borderRadius: appleDesign.borderRadius.lg,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  insightsPlainCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 80,
    padding: appleDesign.spacing.xxl,
  },
  insightsStats: {
    flexDirection: "row",
    gap: appleDesign.spacing.lg,
    marginTop: appleDesign.spacing.sm,
  },
  insightsSubtitle: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsTitle: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title1,
    marginBottom: appleDesign.spacing.xs,
  },
  listeningIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    justifyContent: "center",
    marginTop: appleDesign.spacing.lg,
    paddingVertical: appleDesign.spacing.sm,
  },
  listeningText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  loadingContainer: {
    alignItems: "center",
    gap: appleDesign.spacing.lg,
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  micButton: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.round,
    borderWidth: 2,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: appleDesign.spacing.xl,
    top: appleDesign.spacing.xl,
    width: 56,
    ...appleDesign.shadows.sm,
  },
  micButtonActive: {
    ...appleDesign.shadows.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: appleDesign.spacing.huge,
    paddingHorizontal: appleDesign.spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: appleDesign.spacing.xl,
    paddingHorizontal: appleDesign.spacing.xl,
  },
  modalHeaderButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: appleDesign.button.height.medium,
    minWidth: 60,
    padding: appleDesign.spacing.sm,
  },
  modalScroll: {
    flex: 1,
  },
  modalTitle: {
    fontSize: appleDesign.typography.fontSize.title1,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title1,
  },
  prayerBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondary,
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.lg,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.xs,
  },
  prayerBadgeText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.footnote,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.footnote,
  },
  prayerResult: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xl,
    padding: appleDesign.spacing.xxl,
  },
  prayerText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 30,
    marginBottom: appleDesign.spacing.xl,
  },
  prayerTitle: {
    fontSize: 30,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: 36,
    marginBottom: appleDesign.spacing.lg,
  },
  regenerateButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: appleDesign.spacing.xl,
  },
  regenerateButtonText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  saveButton: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  scrollContent: {
    paddingHorizontal: appleDesign.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },

  statCard: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.lg,
    flex: 1,
    justifyContent: "center",
    minHeight: 120,
    padding: appleDesign.spacing.xxl,
    ...appleDesign.shadows.md,
  },
  statCardBlue: {
    backgroundColor: colors.primary,
  },
  statCardGreen: {
    backgroundColor: colors.success,
  },
  statLabel: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  statNumber: {
    color: colors.text.inverse,
    fontSize: 42,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    lineHeight: 48,
    marginBottom: appleDesign.spacing.sm,
  },
  subtitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.xs,
  },
  themeTag: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.md,
    marginRight: appleDesign.spacing.md,
    paddingHorizontal: appleDesign.spacing.lg,
    paddingVertical: appleDesign.spacing.md,
  },
  themeText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  themesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appleDesign.spacing.sm,
  },
  title: {
    fontSize: appleDesign.typography.fontSize.largeTitle,
    fontWeight: appleDesign.typography.fontWeight.heavy,
    letterSpacing: appleDesign.typography.letterSpacing.tight,
    lineHeight: appleDesign.typography.lineHeight.largeTitle,
  },
  titleInput: {
    borderRadius: appleDesign.borderRadius.lg,
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
    marginBottom: appleDesign.spacing.xl,
    minHeight: 56,
    padding: appleDesign.spacing.xl,
  },
  verseTag: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.sm,
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    marginBottom: appleDesign.spacing.sm,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.sm,
  },
  verseTagText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  versesSection: {
    marginTop: appleDesign.spacing.sm,
  },
  versesSectionTitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.md,
  },
});
