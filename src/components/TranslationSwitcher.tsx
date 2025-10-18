import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { bibleDatabase, BibleTranslation } from "@/services/bibleDatabase";
import { colors } from "@/theme/colors";
import { useThemeColor } from "./Themed";
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

  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const loadTranslations = useCallback(async () => {
    try {
      const allTranslations = await bibleDatabase.getTranslations();
      setTranslations(allTranslations);
    } catch (error) {
      console.error("Error loading translations:", error);
    }
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const handleSelect = (translation: BibleTranslation) => {
    if (translation.isPremium && !isPremium) {
      Alert.alert(
        "Premium Required",
        "This translation requires a premium subscription",
      );
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
        style={[styles.button, { backgroundColor: cardBg }]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="book-open-variant"
          size={18}
          color={textColor}
        />
        <Text style={[styles.buttonText, { color: textColor }]}>
          {getCurrentTranslationName()}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={textColor}
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

          <BlurView intensity={90} style={styles.modalContent}>
            <View style={[styles.modalInner, { backgroundColor: cardBg }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Select Translation
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={textColor}
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
                      { borderBottomColor: borderColor },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.translationInfo}>
                      <View style={styles.translationHeader}>
                        <Text
                          style={[
                            styles.translationAbbr,
                            { color: textColor },
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
                              color={colors.warning}
                            />
                            <Text style={styles.premiumText}>Premium</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.translationName,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {currentTranslation === item.abbreviation && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={colors.success}
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
                      { color: colors.text.secondary },
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
  backdrop: {
    backgroundColor: colors.dark.scrim,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
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
  footer: {
    alignItems: "center",
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  modalInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  premiumBadge: {
    alignItems: "center",
    backgroundColor: colors.warningLightBg,
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  premiumText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "600",
  },
  selectedItem: {
    backgroundColor: colors.successGlow,
    borderRadius: 12,
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  selectedText: {
    color: colors.success,
  },
  translationAbbr: {
    fontSize: 17,
    fontWeight: "700",
  },
  translationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  translationInfo: {
    flex: 1,
  },
  translationItem: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 16,
  },
  translationName: {
    fontSize: 15,
  },
  upgradeButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  upgradeButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "bold",
  },
});
