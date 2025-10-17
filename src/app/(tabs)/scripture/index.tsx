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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { geminiService, VerseExplanation } from "@/services/geminiService";
import { TranslationSwitcher } from "@/components/TranslationSwitcher";
import { VerseActionsSheet } from "@/components/VerseActionsSheet";
import { hapticPatterns } from "@/utils/haptics";
import { VerseCardSkeleton } from "@/components/SkeletonLoader";

export default function Scripture() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const [searchQuery, setSearchQuery] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<any>(null);
  const [explanation, setExplanation] = useState<VerseExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState("NIV");
  const [refreshing, setRefreshing] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [actionSheetVerse, setActionSheetVerse] = useState<any>(null);

  const searchResults = useBibleStore((state) => state.searchResults);
  const isSearching = useBibleStore((state) => state.isSearching);
  const searchVerses = useBibleStore((state) => state.searchVerses);
  const saveVerse = useBibleStore((state) => state.saveVerse);
  const clearSearchResults = useBibleStore((state) => state.clearSearchResults);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchVerses(searchQuery);
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
        </View>

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
              Share what's on your heart and discover relevant verses
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
            {searchResults.map((verse, index) => (
              <Animated.View
                key={`${verse.reference}-${index}`}
                entering={FadeInDown.delay(index * 100)}
              >
                <View style={[styles.verseCard, { backgroundColor: cardBg }]}>
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
                    "{verse.text}"
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
                  <Pressable
                    onPress={() => {
                      hapticPatterns.buttonPress();
                      setActionSheetVerse(verse);
                      setShowActionsSheet(true);
                    }}
                    style={({ pressed }) => [
                      styles.saveButton,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View
                      style={[
                        styles.saveButtonInner,
                        { backgroundColor: "#667eea" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="dots-horizontal-circle-outline"
                        size={28}
                        color="#fff"
                      />
                      <Text style={styles.saveButtonText}>Verse Actions</Text>
                    </View>
                  </Pressable>
                </View>
              </Animated.View>
            ))}
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
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalVerseGradient}
                >
                  <Text style={styles.modalVerseReference}>
                    {selectedVerse.reference}
                  </Text>
                  <Text style={styles.modalVerseText}>
                    "{selectedVerse.text}"
                  </Text>
                </LinearGradient>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contextBox: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
  },
  contextLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  contextText: {
    fontSize: 18,
    lineHeight: 28,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    marginBottom: 24,
    width: 96,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptySubtitle: {
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 300,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  explanationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  explanationSection: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
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
  modalScroll: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalVerseGradient: {
    padding: 24,
  },
  modalVerseHeader: {
    borderRadius: 20,
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.9,
  },
  modalVerseText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 28,
  },
  relatedVerseTag: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  relatedVerseText: {
    fontSize: 14,
    fontWeight: "600",
  },
  relatedVersesList: {
    gap: 8,
  },
  relevanceBox: {
    alignItems: "flex-start",
    marginBottom: 24,
    padding: 16,
  },
  relevanceText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 16,
    marginTop: 24,
    overflow: "hidden",
  },
  saveButtonInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  searchButton: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: "hidden",
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  searchContainer: {
    borderRadius: 16,
    marginBottom: 24,
    padding: 24,
  },
  searchInput: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: "top",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  themeTag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeText: {
    fontSize: 14,
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
  verseCard: {
    borderRadius: 20,
    marginBottom: 24,
    padding: 28,
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
  verseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  verseReference: {
    fontSize: 22,
    fontWeight: "700",
  },
  verseText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontStyle: "italic",
    lineHeight: 34,
    marginBottom: 24,
  },
});
