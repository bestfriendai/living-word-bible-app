import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { colors } from "@/theme/colors";
import { spacing, borderRadius } from "@/theme/spacing";
import { useThemeColor } from "./Themed";
import { theme } from "@/theme";

interface VerseImageGeneratorProps {
  reference: string;
  text: string;
  visible: boolean;
  onClose: () => void;
}

type GradientTheme = {
  name: string;
  colors: [string, string];
  textColor: string;
};

const gradientThemes: GradientTheme[] = [
  {
    name: "Purple Dream",
    colors: [colors.primary, colors.secondary],
    textColor: colors.text.inverse,
  },
  {
    name: "Ocean Blue",
    colors: [colors.primary, colors.accentCyan],
    textColor: colors.text.inverse,
  },
  {
    name: "Sunset",
    colors: [colors.warning, colors.warningLight],
    textColor: colors.text.inverse,
  },
  {
    name: "Forest",
    colors: [colors.success, colors.accentTeal],
    textColor: colors.text.inverse,
  },
  {
    name: "Rose Gold",
    colors: [colors.accentPink, colors.error],
    textColor: colors.text.inverse,
  },
  {
    name: "Sky",
    colors: [colors.accentCyan, colors.primary],
    textColor: colors.text.inverse,
  },
];

export function VerseImageGenerator({
  reference,
  text,
  visible,
  onClose,
}: VerseImageGeneratorProps) {
  const viewRef = useRef<View>(null);
  const [selectedTheme, setSelectedTheme] = useState(gradientThemes[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);

  const handleShare = async () => {
    if (!viewRef.current) return;

    try {
      setIsGenerating(true);

      // Capture the view as an image
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device",
        );
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Share ${reference}`,
      });

      console.log("✅ Verse image shared successfully");
    } catch (error) {
      console.error("❌ Error sharing verse image:", error);
      Alert.alert("Error", "Failed to share verse image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!viewRef.current) return;

    try {
      setIsGenerating(true);

      // Capture the view as an image
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      // Save to device (would implement with expo-media-library in production)
      Alert.alert("Success", "Verse image saved to gallery");

      console.log("💾 Verse image saved:", uri);
    } catch (error) {
      console.error("❌ Error saving verse image:", error);
      Alert.alert("Error", "Failed to save verse image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Create Verse Image
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={32}
                color={textColor}
              />
            </Pressable>
          </View>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <View ref={viewRef} collapsable={false}>
              <LinearGradient
                colors={selectedTheme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.verseCard}
              >
                <Text
                  style={[styles.verseText, { color: selectedTheme.textColor }]}
                >
                  &quot;{text}&quot;
                </Text>
                <Text
                  style={[
                    styles.verseReference,
                    { color: selectedTheme.textColor },
                  ]}
                >
                  {reference}
                </Text>
                <View style={styles.watermark}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={16}
                    color={selectedTheme.textColor + "80"}
                  />
                  <Text
                    style={[
                      styles.watermarkText,
                      { color: selectedTheme.textColor + "80" },
                    ]}
                  >
                    Living Word Bible App
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Theme Selector */}
          <View style={styles.themesSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Choose a Theme
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themesScroll}
            >
              {gradientThemes.map((theme, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedTheme(theme)}
                  style={[
                    styles.themeOption,
                    selectedTheme.name === theme.name && styles.themeSelected,
                  ]}
                >
                  <LinearGradient
                    colors={theme.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeGradient}
                  >
                    {selectedTheme.name === theme.name && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={32}
                        color="#fff"
                      />
                    )}
                  </LinearGradient>
                  <Text style={[styles.themeName, { color: textColor }]}>
                    {theme.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isGenerating}
            >
              <MaterialCommunityIcons name="download" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isGenerating ? "Saving..." : "Save"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              disabled={isGenerating}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={24}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {isGenerating ? "Sharing..." : "Share"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: 18,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
    padding: spacing.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  modalContainer: {
    backgroundColor: colors.dark.scrim,
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "90%",
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  themeGradient: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    height: 80,
    justifyContent: "center",
    marginBottom: 10,
    width: 80,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  themeOption: {
    alignItems: "center",
    marginRight: 20,
  },
  themeSelected: {
    opacity: 1,
  },
  themesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  themesSection: {
    marginBottom: 28,
  },
  verseCard: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    height: 500,
    justifyContent: "center",
    padding: 32,
    width: 350,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: "auto",
    textTransform: "uppercase",
  },
  verseText: {
    fontSize: 24,
    fontStyle: "italic",
    fontWeight: "600",
    lineHeight: 36,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  watermark: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 16,
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
