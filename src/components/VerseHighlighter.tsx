import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { useThemeColor } from "./Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");

export interface VerseHighlight {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  color: "yellow" | "blue" | "green" | "red" | "purple" | "orange";
  note?: string;
  createdAt: string;
}

interface VerseHighlighterProps {
  visible: boolean;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  existingHighlight?: VerseHighlight;
  onClose: () => void;
  onSave: (highlight: Omit<VerseHighlight, "id" | "createdAt">) => void;
  onDelete?: (highlightId: string) => void;
}

const highlightColors = {
  yellow: { bg: "#FEF3C7", border: "#F59E0B", name: "Promise" },
  blue: { bg: "#DBEAFE", border: "#3B82F6", name: "Wisdom" },
  green: { bg: "#D1FAE5", border: "#10B981", name: "Growth" },
  red: { bg: "#FEE2E2", border: "#EF4444", name: "Salvation" },
  purple: { bg: "#EDE9FE", border: "#8B5CF6", name: "Prophecy" },
  orange: { bg: "#FED7AA", border: "#FB923C", name: "Warning" },
};

export default function VerseHighlighter({
  visible,
  verseId,
  book,
  chapter,
  verse,
  existingHighlight,
  onClose,
  onSave,
  onDelete,
}: VerseHighlighterProps) {
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const [selectedColor, setSelectedColor] = useState<VerseHighlight["color"]>(
    existingHighlight?.color || "yellow",
  );
  const [note, setNote] = useState(existingHighlight?.note || "");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      verseId,
      book,
      chapter,
      verse,
      color: selectedColor,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (existingHighlight && onDelete) {
      Alert.alert(
        "Remove Highlight",
        "Are you sure you want to remove this highlight?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              onDelete(existingHighlight.id);
              onClose();
            },
          },
        ],
      );
    }
  };

  const ColorOption = ({ color }: { color: VerseHighlight["color"] }) => {
    const colorConfig = highlightColors[color];
    const isSelected = selectedColor === color;

    return (
      <TouchableOpacity
        style={[
          styles.colorOption,
          {
            backgroundColor: colorConfig.bg,
            borderColor: isSelected
              ? colorConfig.border
              : colorConfig.border + "40",
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => {
          setSelectedColor(color);
          Haptics.selectionAsync();
        }}
      >
        <View
          style={[styles.colorDot, { backgroundColor: colorConfig.border }]}
        />
        <Text style={[styles.colorLabel, { color: textColor }]}>
          {colorConfig.name}
        </Text>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color={colorConfig.border}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>
              {existingHighlight ? "Edit Highlight" : "Highlight Verse"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          {/* Verse Reference */}
          <View style={styles.verseReference}>
            <Text style={[styles.verseText, { color: textColor }]}>
              {book} {chapter}:{verse}
            </Text>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Choose Category
            </Text>
            <View style={styles.colorGrid}>
              {Object.keys(highlightColors).map((color) => (
                <ColorOption
                  key={color}
                  color={color as VerseHighlight["color"]}
                />
              ))}
            </View>
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.noteHeader}
              onPress={() => setShowNoteInput(!showNoteInput)}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Add Note
              </Text>
              <MaterialCommunityIcons
                name={showNoteInput ? "chevron-up" : "chevron-down"}
                size={20}
                color={textColor}
              />
            </TouchableOpacity>

            {showNoteInput && (
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    color: textColor,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                  },
                ]}
                placeholder="Add your thoughts about this verse..."
                placeholderTextColor={textColor + "60"}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {existingHighlight && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actions: {
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  colorDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 8,
    width: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  colorOption: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minWidth: (screenWidth - 40 - 24) / 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  noteHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginTop: 8,
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "flex-end",
  },
  saveButton: {
    backgroundColor: "#10B981",
    flex: 1,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  verseReference: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  verseText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
