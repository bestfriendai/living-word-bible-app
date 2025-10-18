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
import { colors } from "@/theme/colors";
import { spacing, borderRadius } from "@/theme/spacing";
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
  yellow: { bg: "#FEF3C7", border: colors.warning, name: "Promise" },
  blue: { bg: "#DBEAFE", border: colors.primary, name: "Wisdom" },
  green: { bg: "#D1FAE5", border: colors.success, name: "Growth" },
  red: { bg: "#FEE2E2", border: colors.error, name: "Salvation" },
  purple: { bg: "#EDE9FE", border: colors.purple, name: "Prophecy" },
  orange: { bg: "#FED7AA", border: colors.warningLight, name: "Warning" },
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
          styles.colorOptionBorder,
          isSelected && styles.colorOptionSelected,
          {
            backgroundColor: colorConfig.bg,
            borderColor: isSelected
              ? colorConfig.border
              : colorConfig.border + "40",
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
    borderRadius: borderRadius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minWidth: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actions: {
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.transparent,
    borderColor: colors.border.light,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  colorDot: {
    borderRadius: 6,
    height: 12,
    marginRight: spacing.sm,
    width: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  colorOption: {
    alignItems: "center",
    borderRadius: borderRadius.md,
    flexDirection: "row",
    minWidth: (screenWidth - 40 - 24) / 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  colorOptionBorder: {
    borderWidth: 1,
  },
  colorOptionSelected: {
    borderWidth: 2,
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "80%",
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noteHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    marginTop: spacing.sm,
    minHeight: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  overlay: {
    backgroundColor: colors.dark.scrim,
    flex: 1,
    justifyContent: "flex-end",
  },
  saveButton: {
    backgroundColor: colors.success,
    flex: 1,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  verseReference: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  verseText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
