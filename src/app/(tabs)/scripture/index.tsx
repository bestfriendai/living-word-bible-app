import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { geminiService, VerseExplanation } from "@/services/geminiService";
import { TranslationSwitcher } from "@/components/TranslationSwitcher";
import { VerseActionsSheet } from "@/components/VerseActionsSheet";
import VerseHighlighter from "@/components/VerseHighlighter";
import { hapticPatterns } from "@/utils/haptics";
import { VerseCardSkeleton } from "@/components/SkeletonLoader";
import { useSpeechToText } from "@/utils/speechToText";

export default function Scripture() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const [searchQuery, setSearchQuery] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<any>(null);
  const [explanation, setExplanation] = useState<VerseExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState("NIV");
  const [refreshing, setRefreshing] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [actionSheetVerse, setActionSheetVerse] = useState<any>(null);
  const [showHighlighter, setShowHighlighter] = useState(false);
  const [highlighterVerse, setHighlighterVerse] = useState<any>(null);

  const searchResults = useBibleStore((state) => state.searchResults);
  const isSearching = useBibleStore((state) => state.isSearching);
  const searchVerses = useBibleStore((state) => state.searchVerses);
  const saveVerse = useBibleStore((state) => state.saveVerse);
  const addHighlight = useBibleStore((state) => state.addHighlight);
  const removeHighlight = useBibleStore((state) => state.removeHighlight);
  const getHighlightByVerse = useBibleStore(
    (state) => state.getHighlightByVerse,
  );

  // Speech-to-text hook
  const { isListening, startListening, stopListening, resetTranscript } =
    useSpeechToText({
      onResult: (text, isFinal) => {
        if (isFinal) {
          setSearchQuery(text);
          stopListening();
        }
      },
    });

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchVerses(searchQuery);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      await stopListening();
    } else {
      resetTranscript();
      setSearchQuery("");
      await startListening();
      hapticPatterns.buttonPress();
    }
  };

  const handleSaveVerse = (verse: any) => {
    saveVerse(verse);
  };

  const handleExplainVerse = async (verse: any) => {
    setSelectedVerse(verse);
    setShowExplanation(true);
    setIsExplaining(true);

    try {
      const verseExplanation = await geminiService.explainVerse(
        verse.reference,
        verse.text,
      );
      setExplanation(verseExplanation);
    } catch (error) {
      console.error("Error explaining verse:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const closeExplanation = () => {
    setShowExplanation(false);
    setExplanation(null);
    setSelectedVerse(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear current search results
      if (searchQuery.trim()) {
        await searchVerses(searchQuery);
      }
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textColor}
            colors={["#3b82f6"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.subtitle, { color: textColor + "90" }]}>
                Find guidance
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Scripture
              </Text>
            </View>
            <TranslationSwitcher
              currentTranslation={currentTranslation}
              onTranslationChange={setCurrentTranslation}
              isPremium={false}
            />
          </View>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Share what you're going through..."
            placeholderTextColor={textColor + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive,
              { backgroundColor: isListening ? "#ef4444" : cardBg },
            ]}
            onPress={handleVoiceInput}
          >
            <MaterialCommunityIcons
              name={isListening ? "microphone" : "microphone-outline"}
              size={20}
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
              Listening... speak now
            </Text>
          </View>
        )}

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          <View
            style={[
              styles.searchButtonGradient,
              { backgroundColor: "#3b82f6" },
              (!searchQuery.trim() || isSearching) &&
                styles.searchButtonDisabled,
            ]}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="book-search"
                  size={28}
                  color="#fff"
                />
                <Text style={styles.searchButtonText}>Find Scripture</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Empty State */}
        {!isSearching && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: "#3b82f620" }]}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={48}
                color="#3b82f6"
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Find Scripture
            </Text>
            <Text style={[styles.emptySubtitle, { color: textColor + "70" }]}>
              Share what&apos;s on your heart and discover relevant verses
            </Text>
          </View>
        )}

        {/* Loading Skeleton */}
        {isSearching && (
          <View style={styles.resultsContainer}>
            <VerseCardSkeleton />
            <VerseCardSkeleton />
            <VerseCardSkeleton />
          </View>
        )}

        {/* Search Results */}
        {!isSearching && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: textColor }]}>
              {searchResults.length} verses found
            </Text>
            {searchResults.map((verse, index) => {
              const existingHighlight = getHighlightByVerse(
                verse.id || verse.reference,
              );
              const highlightColors = {
                yellow: "#FEF3C7",
                blue: "#DBEAFE",
                green: "#D1FAE5",
                red: "#FEE2E2",
                purple: "#EDE9FE",
                orange: "#FED7AA",
              };

              return (
                <Animated.View
                  key={`${verse.reference}-${index}`}
                  entering={FadeInDown.delay(index * 100)}
                >
                  <View
                    style={[
                      styles.verseCard,
                      {
                        backgroundColor: cardBg,
                        borderLeftWidth: existingHighlight ? 4 : 0,
                        borderLeftColor: existingHighlight
                          ? highlightColors[existingHighlight.color]
                          : "transparent",
                      },
                    ]}
                  >
                    <View style={styles.verseHeader}>
                      <Text
                        style={[
                          styles.verseReference,
                          { color: theme.color.reactBlue.dark },
                        ]}
                      >
                        {verse.reference}
                      </Text>
                    </View>
                    <Text style={[styles.verseText, { color: textColor }]}>
                      &quot;{verse.text}&quot;
                    </Text>
                    {verse.context && (
                      <View
                        style={[
                          styles.contextBox,
                          { backgroundColor: backgroundColor },
                        ]}
                      >
                        <Text
                          style={[styles.contextLabel, { color: textColor }]}
                        >
                          Context:
                        </Text>
                        <Text
                          style={[styles.contextText, { color: textColor }]}
                        >
                          {verse.context}
                        </Text>
                      </View>
                    )}
                    {verse.relevance && (
                      <View style={styles.relevanceBox}>
                        <Text
                          style={[styles.relevanceText, { color: textColor }]}
                        >
                          {verse.relevance}
                        </Text>
                      </View>
                    )}
                    <View style={styles.verseActions}>
                      <Pressable
                        onPress={() => {
                          hapticPatterns.buttonPress();
                          const [book, chapterVerse] =
                            verse.reference.split(" ");
                          const [chapter, verseNum] = chapterVerse.split(":");
                          setHighlighterVerse({
                            id: verse.id || verse.reference,
                            book,
                            chapter: parseInt(chapter),
                            verse: parseInt(verseNum),
                            reference: verse.reference,
                          });
                          setShowHighlighter(true);
                        }}
                        style={({ pressed }) => [
                          styles.actionButton,
                          pressed && { opacity: 0.85 },
                          existingHighlight && {
                            backgroundColor:
                              highlightColors[existingHighlight.color],
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            existingHighlight ? "bookmark" : "bookmark-outline"
                          }
                          size={20}
                          color={existingHighlight ? "#000" : "#fff"}
                        />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          hapticPatterns.buttonPress();
                          setActionSheetVerse(verse);
                          setShowActionsSheet(true);
                        }}
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.moreButton,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="dots-horizontal"
                          size={20}
                          color="#fff"
                        />
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Verse Explanation Modal */}
      <Modal
        visible={showExplanation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeExplanation}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={closeExplanation}>
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Deep Dive
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {selectedVerse && (
              <View style={styles.modalVerseHeader}>
                <View
                  style={[
                    styles.modalVerseGradient,
                    { backgroundColor: "#3b82f6" },
                  ]}
                >
                  <Text style={styles.modalVerseReference}>
                    {selectedVerse.reference}
                  </Text>
                  <Text style={styles.modalVerseText}>
                    &quot;{selectedVerse.text}&quot;
                  </Text>
                </View>
              </View>
            )}

            {isExplaining ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Analyzing scripture...
                </Text>
              </View>
            ) : explanation ? (
              <>
                <View
                  style={[
                    styles.explanationSection,
                    { backgroundColor: cardBg },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <MaterialCommunityIcons
                      name="history"
                      size={24}
                      color="#f59e0b"
                    />
                    <Text
                      style={[styles.explanationTitle, { color: textColor }]}
                    >
                      Historical Context
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.explanationText,
                      { color: textColor + "D0" },
                    ]}
                  >
                    {explanation.historicalContext}
                  </Text>
                </View>

                <View
                  style={[
                    styles.explanationSection,
                    { backgroundColor: cardBg },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <MaterialCommunityIcons
                      name="heart"
                      size={24}
                      color="#ec4899"
                    />
                    <Text
                      style={[styles.explanationTitle, { color: textColor }]}
                    >
                      Spiritual Meaning
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.explanationText,
                      { color: textColor + "D0" },
                    ]}
                  >
                    {explanation.spiritualMeaning}
                  </Text>
                </View>

                <View
                  style={[
                    styles.explanationSection,
                    { backgroundColor: cardBg },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <MaterialCommunityIcons
                      name="lightbulb-on"
                      size={24}
                      color="#10b981"
                    />
                    <Text
                      style={[styles.explanationTitle, { color: textColor }]}
                    >
                      Practical Application
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.explanationText,
                      { color: textColor + "D0" },
                    ]}
                  >
                    {explanation.practicalApplication}
                  </Text>
                </View>

                {explanation.keyThemes && explanation.keyThemes.length > 0 && (
                  <View
                    style={[
                      styles.explanationSection,
                      { backgroundColor: cardBg },
                    ]}
                  >
                    <View style={styles.explanationHeader}>
                      <MaterialCommunityIcons
                        name="tag-multiple"
                        size={24}
                        color="#a855f7"
                      />
                      <Text
                        style={[styles.explanationTitle, { color: textColor }]}
                      >
                        Key Themes
                      </Text>
                    </View>
                    <View style={styles.themesList}>
                      {explanation.keyThemes.map((theme, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.themeTag,
                            { backgroundColor: "#a855f720" },
                          ]}
                        >
                          <Text
                            style={[styles.themeText, { color: "#a855f7" }]}
                          >
                            {theme}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {explanation.relatedVerses &&
                  explanation.relatedVerses.length > 0 && (
                    <View
                      style={[
                        styles.explanationSection,
                        { backgroundColor: cardBg },
                      ]}
                    >
                      <View style={styles.explanationHeader}>
                        <MaterialCommunityIcons
                          name="book-open-variant"
                          size={24}
                          color="#3b82f6"
                        />
                        <Text
                          style={[
                            styles.explanationTitle,
                            { color: textColor },
                          ]}
                        >
                          Related Verses
                        </Text>
                      </View>
                      <View style={styles.relatedVersesList}>
                        {explanation.relatedVerses.map((verse, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.relatedVerseTag,
                              { backgroundColor: "#3b82f620" },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="link-variant"
                              size={16}
                              color="#3b82f6"
                            />
                            <Text
                              style={[
                                styles.relatedVerseText,
                                { color: "#3b82f6" },
                              ]}
                            >
                              {verse}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* Verse Actions Bottom Sheet */}
      <VerseActionsSheet
        visible={showActionsSheet}
        onClose={() => setShowActionsSheet(false)}
        verse={actionSheetVerse}
        onSave={() => {
          if (actionSheetVerse) {
            handleSaveVerse(actionSheetVerse);
          }
        }}
        onExplain={() => {
          if (actionSheetVerse) {
            handleExplainVerse(actionSheetVerse);
          }
        }}
      />

      {/* Verse Highlighter Modal */}
      <VerseHighlighter
        visible={showHighlighter}
        verseId={highlighterVerse?.id || ""}
        book={highlighterVerse?.book || ""}
        chapter={highlighterVerse?.chapter || 0}
        verse={highlighterVerse?.verse || 0}
        existingHighlight={
          highlighterVerse
            ? getHighlightByVerse(highlighterVerse.id)
            : undefined
        }
        onClose={() => {
          setShowHighlighter(false);
          setHighlighterVerse(null);
        }}
        onSave={(highlight) => {
          addHighlight(highlight);
        }}
        onDelete={(highlightId) => {
          removeHighlight(highlightId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: appleDesign.borderRadius.xl,
    justifyContent: "center",
    padding: appleDesign.spacing.sm,
  },
  container: {
    flex: 1,
  },
  contextBox: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.xl,
  },
  contextLabel: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    letterSpacing: appleDesign.typography.letterSpacing.wide,
    lineHeight: appleDesign.typography.lineHeight.title3,
    marginBottom: appleDesign.spacing.sm,
    textTransform: "uppercase",
  },
  contextText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 30,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.xxl,
    width: 96,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptySubtitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    maxWidth: 300,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 30,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: 36,
    marginBottom: appleDesign.spacing.md,
  },
  explanationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    marginBottom: appleDesign.spacing.md,
  },
  explanationSection: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.lg,
    padding: appleDesign.spacing.xl,
  },
  explanationText: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 26,
  },
  explanationTitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  header: {
    marginBottom: appleDesign.spacing.xxl,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "space-between",
  },
  listeningIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    justifyContent: "center",
    marginBottom: appleDesign.spacing.lg,
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
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  micButton: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.round,
    bottom: appleDesign.spacing.xxl,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: appleDesign.spacing.xxl,
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
  modalScroll: {
    flex: 1,
  },
  modalTitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  modalVerseGradient: {
    padding: appleDesign.spacing.xxl,
  },
  modalVerseHeader: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xxl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalVerseReference: {
    color: "#fff",
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.md,
    opacity: 0.9,
  },
  modalVerseText: {
    color: "#fff",
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: 30,
  },
  moreButton: {
    backgroundColor: "#6b7280",
  },
  relatedVerseTag: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.sm,
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.md,
  },
  relatedVerseText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  relatedVersesList: {
    gap: appleDesign.spacing.sm,
  },
  relevanceBox: {
    alignItems: "flex-start",
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.lg,
  },
  relevanceText: {
    flex: 1,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: 30,
  },
  resultsContainer: {
    marginTop: appleDesign.spacing.lg,
  },
  resultsTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
    marginBottom: appleDesign.spacing.xxl,
  },
  scrollContent: {
    paddingHorizontal: appleDesign.spacing.xl,
  },

  scrollView: {
    flex: 1,
  },
  searchButton: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xxxl,
    overflow: "hidden",
  },
  searchButtonDisabled: {
    opacity: appleDesign.opacity.medium,
  },
  searchButtonGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "center",
    minHeight: 60,
    paddingHorizontal: appleDesign.spacing.xxl,
    paddingVertical: appleDesign.spacing.lg,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  searchContainer: {
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.xxl,
    position: "relative",
  },
  searchInput: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    minHeight: 120,
    paddingRight: 60,
    textAlignVertical: "top",
  },
  subtitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.xs,
  },
  themeTag: {
    borderRadius: appleDesign.borderRadius.sm,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.sm,
  },
  themeText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
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
  verseActions: {
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    marginTop: appleDesign.spacing.lg,
  },
  verseCard: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xxl,
    padding: appleDesign.spacing.xxxl,
    ...appleDesign.shadows.sm,
  },
  verseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appleDesign.spacing.xl,
  },
  verseReference: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  verseText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: appleDesign.typography.fontSize.title2,
    fontStyle: "italic",
    lineHeight: 36,
    marginBottom: appleDesign.spacing.xxl,
  },
});
