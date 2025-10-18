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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { colors } from "@/theme/colors";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
  const textSecondary = useThemeColor(theme.color.textSecondary);
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
            colors={[colors.primary]}
          />
        }
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                Find guidance
              </Text>
              <Text style={[styles.title, { color: textColor }]}>
                Scripture Search
              </Text>
              <Text
                style={[styles.headerDescription, { color: textSecondary }]}
              >
                Discover relevant verses for your journey
              </Text>
            </View>
            <TranslationSwitcher
              currentTranslation={currentTranslation}
              onTranslationChange={setCurrentTranslation}
              isPremium={false}
            />
          </View>
        </View>

        {/* Enhanced Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
          <View style={styles.searchHeader}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={textSecondary}
            />
            <Text style={[styles.searchLabel, { color: textSecondary }]}>
              What&apos;s on your heart?
            </Text>
          </View>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="              Share what're going through or looking for..."
            placeholderTextColor={textColor + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.searchActions}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isListening && styles.micButtonActive,
                isListening && { backgroundColor: colors.error },
                !isListening && { backgroundColor: colors.background.tertiary },
              ]}
              onPress={handleVoiceInput}
            >
              <MaterialCommunityIcons
                name={isListening ? "microphone" : "microphone-outline"}
                size={20}
                color={isListening ? colors.text.inverse : textColor}
              />
            </TouchableOpacity>
            {searchQuery.trim() && (
              <TouchableOpacity
                style={[
                  styles.clearButton,
                  { backgroundColor: colors.background.tertiary },
                ]}
                onPress={() => setSearchQuery("")}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {isListening && (
          <View style={styles.listeningIndicator}>
            <View style={styles.listeningDot} />
            <Text style={[styles.listeningText, { color: colors.error }]}>
              Listening... speak from your heart
            </Text>
          </View>
        )}

        {/* Enhanced Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.searchButtonGradient,
              (!searchQuery.trim() || isSearching) &&
                styles.searchButtonDisabled,
            ]}
          >
            {isSearching ? (
              <ActivityIndicator color={colors.text.inverse} size="large" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="book-search"
                  size={28}
                  color={colors.text.inverse}
                />
                <Text style={styles.searchButtonText}>Find Scripture</Text>
                <Text style={styles.searchButtonSubtext}>
                  Search {searchQuery.trim().split(" ").length} words
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Enhanced Empty State */}
        {!isSearching && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primaryGlow },
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Discover Scripture
            </Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
              Share what&apos;s on your heart and find relevant verses
            </Text>
            <View style={styles.suggestionsList}>
              <Text style={[styles.suggestionsTitle, { color: textSecondary }]}>
                Try searching for:
              </Text>
              <View style={styles.suggestionChips}>
                {["peace", "strength", "guidance", "hope"].map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={[styles.suggestionChip, { backgroundColor: cardBg }]}
                    onPress={() => setSearchQuery(suggestion)}
                  >
                    <Text style={[styles.suggestionText, { color: textColor }]}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
                <View
                  key={`${verse.reference}-${index}`}
                  style={[
                    styles.verseCard,
                    { backgroundColor: cardBg },
                    existingHighlight && styles.highlightedVerse,
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
                      <Text style={[styles.contextLabel, { color: textColor }]}>
                        Context:
                      </Text>
                      <Text style={[styles.contextText, { color: textColor }]}>
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
                        const [book, chapterVerse] = verse.reference.split(" ");
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
                        color={
                          existingHighlight
                            ? colors.text.primary
                            : colors.text.inverse
                        }
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
                        color={colors.text.inverse}
                      />
                    </Pressable>
                  </View>
                </View>
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
            <View style={styles.spacerWidth} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {selectedVerse && (
              <View style={styles.modalVerseHeader}>
                <View style={styles.modalVerseGradient}>
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
                <ActivityIndicator size="large" color={colors.primary} />
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
                      color={colors.warning}
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
                      color={colors.accentPink}
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
                      color={colors.success}
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
                        color={colors.secondary}
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
                          style={[styles.themeTag, styles.themeTagBackground]}
                        >
                          <Text
                            style={[styles.themeText, styles.themeTextColor]}
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
                          color={colors.primary}
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
                              styles.relatedVerseTagBackground,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="link-variant"
                              size={16}
                              color={colors.primary}
                            />
                            <Text
                              style={[
                                styles.relatedVerseText,
                                styles.relatedVerseTextColor,
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
    backgroundColor: colors.primary,
    borderRadius: appleDesign.borderRadius.xl,
    justifyContent: "center",
    padding: appleDesign.spacing.sm,
  },
  clearButton: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: appleDesign.spacing.sm,
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
  headerDescription: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginTop: appleDesign.spacing.xs,
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
  highlightedVerse: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
  },
  listeningDot: {
    backgroundColor: colors.error,
    borderRadius: 4,
    height: 8,
    marginLeft: appleDesign.spacing.sm,
    width: 8,
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
    backgroundColor: colors.primary,
    padding: appleDesign.spacing.xxl,
  },
  modalVerseHeader: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xxl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.md,
    opacity: 0.9,
  },
  modalVerseText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: 30,
  },
  moreButton: {
    backgroundColor: colors.text.secondary,
  },
  relatedVerseTag: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.sm,
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.md,
  },
  relatedVerseTagBackground: {
    backgroundColor: colors.primaryGlow,
  },
  relatedVerseText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  relatedVerseTextColor: {
    color: colors.primary,
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
  searchActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: appleDesign.spacing.md,
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
  searchButtonSubtext: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.regular,
    marginTop: appleDesign.spacing.xs,
  },
  searchButtonText: {
    color: colors.text.inverse,
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  searchContainer: {
    borderRadius: appleDesign.borderRadius.xl,
    marginBottom: appleDesign.spacing.xl,
    padding: appleDesign.spacing.xl,
    position: "relative",
    ...appleDesign.shadows.sm,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: appleDesign.spacing.md,
  },
  searchInput: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    minHeight: 120,
    paddingRight: 60,
    textAlignVertical: "top",
  },
  searchLabel: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    marginLeft: appleDesign.spacing.sm,
  },
  spacerWidth: {
    width: 50,
  },
  subtitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
    marginBottom: appleDesign.spacing.xs,
  },
  suggestionChip: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: appleDesign.borderRadius.xl,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.sm,
  },
  suggestionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appleDesign.spacing.sm,
  },
  suggestionText: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.medium,
  },
  suggestionsList: {
    marginTop: appleDesign.spacing.xl,
  },
  suggestionsTitle: {
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    marginBottom: appleDesign.spacing.md,
  },
  themeTag: {
    borderRadius: appleDesign.borderRadius.sm,
    paddingHorizontal: appleDesign.spacing.md,
    paddingVertical: appleDesign.spacing.sm,
  },
  themeTagBackground: {
    backgroundColor: colors.secondaryGlow,
  },
  themeText: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
  },
  themeTextColor: {
    color: colors.secondary,
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
    borderRadius: appleDesign.borderRadius.lg,
    marginBottom: appleDesign.spacing.lg,
    padding: appleDesign.spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.text.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
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
