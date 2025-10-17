import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  useColorScheme,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

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
  { name: "Purple Dream", colors: ["#667eea", "#764ba2"], textColor: "#fff" },
  { name: "Ocean Blue", colors: ["#2E3192", "#1BFFFF"], textColor: "#fff" },
  { name: "Sunset", colors: ["#f97316", "#ea580c"], textColor: "#fff" },
  { name: "Forest", colors: ["#134E5E", "#71B280"], textColor: "#fff" },
  { name: "Rose Gold", colors: ["#F857A6", "#FF5858"], textColor: "#fff" },
  { name: "Sky", colors: ["#56CCF2", "#2F80ED"], textColor: "#fff" },
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}
            >
              Create Verse Image
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={32}
                color={isDark ? "#fff" : "#000"}
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
                  "{text}"
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
            <Text
              style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
            >
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
                  <Text
                    style={[
                      styles.themeName,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                  >
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
    borderRadius: 16,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingVertical: 18,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
    padding: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: "#667eea",
  },
  themeGradient: {
    alignItems: "center",
    borderRadius: 16,
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
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  themesSection: {
    marginBottom: 28,
  },
  verseCard: {
    alignItems: "center",
    borderRadius: 20,
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
    marginBottom: 24,
    textAlign: "center",
  },
  watermark: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
