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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBibleStore } from "@/store/bibleStore";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Journal() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState("");
  const [newPrayerContent, setNewPrayerContent] = useState("");

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
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.color.reactBlue.dark }]}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

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
});
