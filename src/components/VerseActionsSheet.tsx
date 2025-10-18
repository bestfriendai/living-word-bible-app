import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { hapticPatterns } from "@/utils/haptics";
import { socialSharingService } from "@/services/socialSharingService";

interface VerseActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  verse: {
    reference: string;
    text: string;
  } | null;
  onSave?: () => void;
  onExplain?: () => void;
  onMemorize?: () => void;
}

/**
 * Modern bottom sheet for verse actions
 * Implements 2025 design patterns with gesture support
 */
export function VerseActionsSheet({
  visible,
  onClose,
  verse,
  onSave,
  onExplain,
  onMemorize,
}: VerseActionsSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!verse) return null;

  const handleCopy = async () => {
    hapticPatterns.buttonPress();
    try {
      await socialSharingService.copyToClipboard({
        text: `"${verse.text}" - ${verse.reference}`,
        type: "verse",
      });
      hapticPatterns.taskComplete();
      Alert.alert("Copied!", "Verse copied to clipboard");
      onClose();
    } catch (error) {
      console.error("Error copying:", error);
      Alert.alert("Error", "Failed to copy verse to clipboard");
    }
  };

  const handleShare = async () => {
    hapticPatterns.buttonPress();
    try {
      const success = await socialSharingService.shareVerse(
        verse.reference,
        verse.text,
      );

      if (success) {
        hapticPatterns.taskComplete();
      } else {
        Alert.alert("Sharing", "Verse copied to clipboard instead");
      }
      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share verse");
    }
  };

  const handleSave = () => {
    hapticPatterns.saveVerse();
    onSave?.();
    onClose();
  };

  const handleExplain = () => {
    hapticPatterns.buttonPress();
    onExplain?.();
    onClose();
  };

  const handleMemorize = () => {
    hapticPatterns.buttonPress();
    onMemorize?.();
    onClose();
  };

  const actionItems = [
    {
      icon: "bookmark-outline",
      label: "Save Verse",
      color: "#10b981",
      onPress: handleSave,
      show: !!onSave,
    },
    {
      icon: "lightbulb-on-outline",
      label: "Deep Dive",
      color: "#f59e0b",
      onPress: handleExplain,
      show: !!onExplain,
    },
    {
      icon: "brain",
      label: "Memorize",
      color: "#a855f7",
      onPress: handleMemorize,
      show: !!onMemorize,
    },
    {
      icon: "content-copy",
      label: "Copy",
      color: "#3b82f6",
      onPress: handleCopy,
      show: true,
    },
    {
      icon: "share-variant",
      label: "Share",
      color: "#ec4899",
      onPress: handleShare,
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            hapticPatterns.modalClose();
            onClose();
          }}
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
            style={StyleSheet.absoluteFill}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            />
          </MotiView>
        </Pressable>

        {/* Bottom Sheet */}
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          exit={{ translateY: 400 }}
          transition={{
            type: "spring",
            damping: 35,
            stiffness: 400,
          }}
          style={styles.sheetContainer}
        >
          <BlurView
            intensity={isDark ? 90 : 70}
            tint={isDark ? "dark" : "light"}
            style={styles.sheet}
          >
            <View
              style={[
                styles.sheetContent,
                {
                  backgroundColor: isDark
                    ? "rgba(28,28,30,0.95)"
                    : "rgba(255,255,255,0.95)",
                },
              ]}
            >
              {/* Handle */}
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#48484a" : "#d1d1d6" },
                  ]}
                />
              </View>

              {/* Verse Preview */}
              <View style={styles.versePreview}>
                <Text
                  style={[
                    styles.verseReference,
                    { color: isDark ? "#ffffff" : "#000000" },
                  ]}
                >
                  {verse.reference}
                </Text>
                <Text
                  style={[
                    styles.verseText,
                    { color: isDark ? "#e5e5e7" : "#1c1c1e" },
                  ]}
                  numberOfLines={2}
                >
                  &quot;{verse.text}&quot;
                </Text>
              </View>

              {/* Actions Grid */}
              <View style={styles.actionsGrid}>
                {actionItems.map((item, index) => (
                  <MotiView
                    key={item.label}
                    from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{
                      type: "spring",
                      delay: index * 50,
                      damping: 20,
                    }}
                    style={styles.actionItemWrapper}
                  >
                    <Pressable
                      onPress={item.onPress}
                      style={({ pressed }) => [
                        styles.actionItem,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View
                        style={[
                          styles.actionIconContainer,
                          {
                            backgroundColor: isDark
                              ? `${item.color}20`
                              : `${item.color}15`,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.icon as any}
                          size={24}
                          color={item.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.actionLabel,
                          { color: isDark ? "#ffffff" : "#000000" },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  </MotiView>
                ))}
              </View>

              {/* Cancel Button */}
              <Pressable
                onPress={() => {
                  hapticPatterns.modalClose();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(72,72,74,0.5)"
                      : "rgba(142,142,147,0.15)",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: isDark ? "#ffffff" : "#000000" },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionIconContainer: {
    alignItems: "center",
    borderRadius: 20,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  actionItem: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  actionItemWrapper: {
    width: "31%",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelButton: {
    alignItems: "center",
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  handle: {
    borderRadius: 3,
    height: 5,
    width: 40,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  versePreview: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.7,
    textTransform: "uppercase",
  },
  verseText: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
});
