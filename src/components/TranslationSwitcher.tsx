import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { bibleDatabase, BibleTranslation } from "@/services/bibleDatabase";
import { theme } from "@/theme";

interface TranslationSwitcherProps {
  currentTranslation: string;
  onTranslationChange: (translation: string) => void;
  isPremium?: boolean;
}

export function TranslationSwitcher({
  currentTranslation,
  onTranslationChange,
  isPremium = false,
}: TranslationSwitcherProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const allTranslations = await bibleDatabase.getTranslations();
      setTranslations(allTranslations);
    } catch (error) {
      console.error("Error loading translations:", error);
      // If database not initialized yet, retry after a short delay
      if (error instanceof Error && error.message.includes("not initialized")) {
        setTimeout(() => {
          loadTranslations();
        }, 500);
      }
    }
  };

  const handleSelect = (translation: BibleTranslation) => {
    if (translation.isPremium && !isPremium) {
      // Show premium upgrade prompt
      alert("This translation requires a premium subscription");
      return;
    }

    onTranslationChange(translation.abbreviation);
    setModalVisible(false);
  };

  const getCurrentTranslationName = () => {
    const current = translations.find(
      (t) => t.abbreviation === currentTranslation,
    );
    return current?.abbreviation || "NIV";
  };

  return (
    <>
      {/* Translation Button */}
      <Pressable
        style={[
          styles.button,
          { backgroundColor: isDark ? "#2D2D3A" : "#F0F0F5" },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="book-open-variant"
          size={18}
          color={isDark ? "#FFFFFF" : "#000000"}
        />
        <Text
          style={[styles.buttonText, { color: isDark ? "#FFFFFF" : "#000000" }]}
        >
          {getCurrentTranslationName()}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={isDark ? "#FFFFFF" : "#000000"}
        />
      </Pressable>

      {/* Translation Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setModalVisible(false)}
          />

          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={styles.modalContent}
          >
            <View
              style={[
                styles.modalInner,
                {
                  backgroundColor: isDark
                    ? "rgba(45,45,58,0.95)"
                    : "rgba(255,255,255,0.95)",
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  Select Translation
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={isDark ? "#FFFFFF" : "#000000"}
                  />
                </Pressable>
              </View>

              {/* Translations List */}
              <FlatList
                data={translations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.translationItem,
                      currentTranslation === item.abbreviation &&
                        styles.selectedItem,
                      { borderBottomColor: isDark ? "#3D3D4A" : "#E0E0E5" },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.translationInfo}>
                      <View style={styles.translationHeader}>
                        <Text
                          style={[
                            styles.translationAbbr,
                            { color: isDark ? "#FFFFFF" : "#000000" },
                            currentTranslation === item.abbreviation &&
                              styles.selectedText,
                          ]}
                        >
                          {item.abbreviation}
                        </Text>
                        {item.isPremium && !isPremium && (
                          <View style={styles.premiumBadge}>
                            <MaterialCommunityIcons
                              name="crown"
                              size={12}
                              color="#FFD700"
                            />
                            <Text style={styles.premiumText}>Premium</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.translationName,
                          { color: isDark ? "#AAAAAA" : "#666666" },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {currentTranslation === item.abbreviation && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    )}
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />

              {/* Footer */}
              {!isPremium && (
                <View style={styles.footer}>
                  <Text
                    style={[
                      styles.footerText,
                      { color: isDark ? "#AAAAAA" : "#666666" },
                    ]}
                  >
                    Unlock all translations with Premium
                  </Text>
                  <Pressable style={styles.upgradeButton}>
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Button styles
  button: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  // Translation item styles
  translationItem: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 16,
  },
  selectedItem: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  translationInfo: {
    flex: 1,
  },
  translationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  translationAbbr: {
    fontSize: 17,
    fontWeight: "700",
  },
  selectedText: {
    color: "#4CAF50",
  },
  translationName: {
    fontSize: 15,
  },

  // Premium badge styles
  premiumBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  premiumText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
  },

  // Footer styles
  footer: {
    alignItems: "center",
    borderTopColor: "#E0E0E5",
    borderTopWidth: 1,
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  upgradeButton: {
    alignItems: "center",
    backgroundColor: "#667eea",
    borderRadius: 20,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
