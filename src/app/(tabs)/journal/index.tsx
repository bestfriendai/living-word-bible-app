import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { geminiService } from "@/services/geminiService";

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

  const handleAddPrayer = () => {
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
  };

  const handleDeletePrayer = (id: string, title: string) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${title}"?`)) {
        deleteJournalEntry(id);
      }
    } else {
      Alert.alert("Delete Prayer", `Are you sure you want to delete "${title}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteJournalEntry(id) },
      ]);
    }
  };

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
      const prayerInsights = await geminiService.analyzePrayerJournal(journalEntries);
      setInsights(prayerInsights);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setIsLoadingInsights(false);
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
            <Text style={[styles.subtitle, { color: textColor + "90" }]}>Prayer tracker</Text>
            <Text style={[styles.title, { color: textColor }]}>Journal</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: "#a855f7" }]}
              onPress={() => setShowAIModal(true)}
            >
              <MaterialCommunityIcons name="auto-fix" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.color.reactBlue.dark }]}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Insights Card */}
        {journalEntries.length >= 3 && (
          <TouchableOpacity
            style={styles.insightsCard}
            onPress={handleLoadInsights}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.insightsGradient}
            >
              <View style={styles.insightsContent}>
                <MaterialCommunityIcons name="chart-arc" size={32} color="#fff" />
                <View style={styles.insightsTextContainer}>
                  <Text style={styles.insightsTitle}>Prayer Insights</Text>
                  <Text style={styles.insightsSubtitle}>
                    View AI analysis of your prayer journey
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Journal Entries */}
        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: "#a855f720" }]}>
              <MaterialCommunityIcons name="notebook-outline" size={64} color="#a855f7" />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>Begin Your Journal</Text>
            <Text style={[styles.emptySubtitle, { color: textColor + "70" }]}>
              Document your prayers and witness God's faithfulness
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
                      <Text style={[styles.entryDate, { color: textColor + "70" }]}>
                        {formatDate(entry.createdAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePrayer(entry.id, entry.title)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={22}
                        color={textColor + "70"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.entryContent, { color: textColor + "D0" }]} numberOfLines={3}>
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
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>New Prayer</Text>
            <TouchableOpacity onPress={handleAddPrayer}>
              <Text style={[styles.saveButton, { color: theme.color.reactBlue.dark }]}>
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
              style={[styles.titleInput, { color: textColor, borderColor: cardBg, backgroundColor: cardBg }]}
              placeholder="Prayer Title"
              placeholderTextColor={textColor + "50"}
              value={newPrayerTitle}
              onChangeText={setNewPrayerTitle}
            />

            <TextInput
              style={[styles.contentInput, { color: textColor, borderColor: cardBg, backgroundColor: cardBg }]}
              placeholder="Write your prayer here..."
              placeholderTextColor={textColor + "50"}
              value={newPrayerContent}
              onChangeText={setNewPrayerContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* AI Prayer Generator Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={() => { setShowAIModal(false); handleResetAI(); }}>
              <MaterialCommunityIcons name="close" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>AI Prayer</Text>
            {generatedPrayer ? (
              <TouchableOpacity onPress={handleSaveGeneratedPrayer}>
                <Text style={[styles.saveButton, { color: "#a855f7" }]}>
                  Save
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
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
                  <LinearGradient
                    colors={["#a855f7", "#ec4899"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiIconGradient}
                  >
                    <MaterialCommunityIcons name="auto-fix" size={32} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.aiTitle, { color: textColor }]}>AI Prayer Generator</Text>
                  <Text style={[styles.aiSubtitle, { color: textColor + "70" }]}>
                    Describe your situation and let AI help you pray
                  </Text>
                </View>

                <TextInput
                  style={[styles.aiInput, { color: textColor, borderColor: cardBg, backgroundColor: cardBg }]}
                  placeholder="What's on your heart? (e.g., 'I'm feeling anxious about my job interview')"
                  placeholderTextColor={textColor + "50"}
                  value={aiSituation}
                  onChangeText={setAISituation}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
                  onPress={handleGeneratePrayer}
                  disabled={isGenerating}
                >
                  <LinearGradient
                    colors={isGenerating ? ["#9333ea80", "#db278080"] : ["#9333ea", "#db2777"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.generateGradient}
                  >
                    {isGenerating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="auto-fix" size={20} color="#fff" />
                        <Text style={styles.generateButtonText}>Generate Prayer</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.prayerResult, { backgroundColor: cardBg }]}>
                  <View style={styles.prayerBadge}>
                    <Text style={styles.prayerBadgeText}>{generatedPrayer.category.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.prayerTitle, { color: textColor }]}>
                    {generatedPrayer.title}
                  </Text>
                  <Text style={[styles.prayerText, { color: textColor + "D0" }]}>
                    {generatedPrayer.prayer}
                  </Text>
                  {generatedPrayer.suggestedVerses && generatedPrayer.suggestedVerses.length > 0 && (
                    <View style={styles.versesSection}>
                      <Text style={[styles.versesSectionTitle, { color: textColor }]}>
                        Suggested Verses
                      </Text>
                      {generatedPrayer.suggestedVerses.map((verse: string, idx: number) => (
                        <View key={idx} style={[styles.verseTag, { backgroundColor: "#a855f720" }]}>
                          <MaterialCommunityIcons name="book-open-variant" size={14} color="#a855f7" />
                          <Text style={[styles.verseTagText, { color: "#a855f7" }]}>{verse}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleResetAI}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color={textColor + "70"} />
                  <Text style={[styles.regenerateButtonText, { color: textColor + "70" }]}>
                    Generate Another Prayer
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Prayer Insights Modal */}
      <Modal
        visible={showInsights}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsights(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={() => setShowInsights(false)}>
              <MaterialCommunityIcons name="close" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>Prayer Insights</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
          >
            {isLoadingInsights ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Analyzing your prayers...
                </Text>
              </View>
            ) : insights ? (
              <>
                <View style={styles.insightStatsRow}>
                  <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                  >
                    <Text style={styles.statNumber}>{insights.totalPrayers}</Text>
                    <Text style={styles.statLabel}>Total Prayers</Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                  >
                    <Text style={styles.statNumber}>{insights.answeredPrayers}</Text>
                    <Text style={styles.statLabel}>Answered</Text>
                  </LinearGradient>
                </View>

                {insights.commonThemes && insights.commonThemes.length > 0 && (
                  <View style={[styles.insightSection, { backgroundColor: cardBg }]}>
                    <View style={styles.insightHeader}>
                      <MaterialCommunityIcons name="tag-multiple" size={24} color="#a855f7" />
                      <Text style={[styles.insightTitle, { color: textColor }]}>
                        Common Themes
                      </Text>
                    </View>
                    <View style={styles.themesList}>
                      {insights.commonThemes.map((theme: string, idx: number) => (
                        <View key={idx} style={[styles.themeTag, { backgroundColor: "#a855f720" }]}>
                          <Text style={[styles.themeText, { color: "#a855f7" }]}>{theme}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {insights.encouragement && (
                  <View style={[styles.insightSection, { backgroundColor: cardBg }]}>
                    <View style={styles.insightHeader}>
                      <MaterialCommunityIcons name="heart" size={24} color="#ec4899" />
                      <Text style={[styles.insightTitle, { color: textColor }]}>
                        Encouragement
                      </Text>
                    </View>
                    <Text style={[styles.insightText, { color: textColor + "D0" }]}>
                      {insights.encouragement}
                    </Text>
                  </View>
                )}

                {insights.suggestedFocus && (
                  <View style={[styles.insightSection, { backgroundColor: cardBg }]}>
                    <View style={styles.insightHeader}>
                      <MaterialCommunityIcons name="target" size={24} color="#f59e0b" />
                      <Text style={[styles.insightTitle, { color: textColor }]}>
                        Suggested Focus
                      </Text>
                    </View>
                    <Text style={[styles.insightText, { color: textColor + "D0" }]}>
                      {insights.suggestedFocus}
                    </Text>
                  </View>
                )}

                {insights.growthAreas && insights.growthAreas.length > 0 && (
                  <View style={[styles.insightSection, { backgroundColor: cardBg }]}>
                    <View style={styles.insightHeader}>
                      <MaterialCommunityIcons name="chart-line" size={24} color="#10b981" />
                      <Text style={[styles.insightTitle, { color: textColor }]}>
                        Growth Areas
                      </Text>
                    </View>
                    <View style={styles.growthList}>
                      {insights.growthAreas.map((area: string, idx: number) => (
                        <View key={idx} style={styles.growthItem}>
                          <MaterialCommunityIcons name="chevron-right" size={20} color="#10b981" />
                          <Text style={[styles.growthText, { color: textColor + "D0" }]}>{area}</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
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
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#a855f7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  entriesContainer: {
    gap: 16,
  },
  entryCard: {
    borderRadius: 16,
    padding: 20,
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
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryHeaderLeft: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 17,
    padding: 16,
    borderRadius: 12,
    minHeight: 200,
    textAlignVertical: "top",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#a855f7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
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
  aiIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#a855f7",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  aiTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  aiSubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 300,
  },
  aiInput: {
    fontSize: 17,
    padding: 16,
    borderRadius: 12,
    minHeight: 150,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  generateButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#9333ea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  prayerResult: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  prayerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#a855f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  prayerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  prayerText: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 20,
  },
  versesSection: {
    marginTop: 8,
  },
  versesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  verseTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  verseTagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  insightsCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  insightsGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  insightsContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  insightsSubtitle: {
    color: "#ffffff90",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  insightStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
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
  statNumber: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#ffffff90",
    fontSize: 14,
    fontWeight: "600",
  },
  insightSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
  },
  themesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  growthList: {
    gap: 12,
  },
  growthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  growthText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
});
