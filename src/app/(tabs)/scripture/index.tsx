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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Scripture() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useBibleStore((state) => state.searchResults);
  const isSearching = useBibleStore((state) => state.isSearching);
  const searchVerses = useBibleStore((state) => state.searchVerses);
  const saveVerse = useBibleStore((state) => state.saveVerse);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchVerses(searchQuery);
    }
  };

  const handleSaveVerse = (verse: any) => {
    saveVerse(verse);
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: textColor + "90" }]}>Find guidance</Text>
          <Text style={[styles.title, { color: textColor }]}>Scripture</Text>
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
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.searchButtonGradient,
              (!searchQuery.trim() || isSearching) && styles.searchButtonDisabled,
            ]}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="book-search" size={20} color="#fff" />
                <Text style={styles.searchButtonText}>Find Scripture</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Empty State */}
        {!isSearching && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: "#3b82f620" }]}>
              <MaterialCommunityIcons name="book-open-variant" size={48} color="#3b82f6" />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>Find Scripture</Text>
            <Text style={[styles.emptySubtitle, { color: textColor + "70" }]}>
              Share what's on your heart and discover relevant verses
            </Text>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
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
                    <Text style={[styles.verseReference, { color: theme.color.reactBlue.dark }]}>
                      {verse.reference}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleSaveVerse(verse)}
                      style={styles.bookmarkButton}
                    >
                      <MaterialCommunityIcons
                        name="bookmark-outline"
                        size={24}
                        color={theme.color.reactBlue.dark}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.verseText, { color: textColor }]}>"{verse.text}"</Text>
                  {verse.context && (
                    <View style={[styles.contextBox, { backgroundColor: backgroundColor }]}>
                      <Text style={[styles.contextLabel, { color: textColor + "70" }]}>
                        Context:
                      </Text>
                      <Text style={[styles.contextText, { color: textColor + "90" }]}>
                        {verse.context}
                      </Text>
                    </View>
                  )}
                  {verse.relevance && (
                    <View style={styles.relevanceBox}>
                      <MaterialCommunityIcons
                        name="lightbulb-on-outline"
                        size={18}
                        color="#f59e0b"
                      />
                      <Text style={[styles.relevanceText, { color: textColor + "90" }]}>
                        {verse.relevance}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
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
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  searchContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  searchButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 32,
  },
  searchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 280,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  verseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: "700",
  },
  bookmarkButton: {
    padding: 4,
  },
  verseText: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 12,
    fontStyle: "italic",
  },
  contextBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: 14,
    lineHeight: 20,
  },
  relevanceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  relevanceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
