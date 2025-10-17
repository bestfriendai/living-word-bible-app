import * as Haptics from "expo-haptics";

/**
 * Centralized haptic feedback service
 * Provides consistent tactile feedback throughout the app
 * Based on October 2025 UX best practices
 */

export type HapticFeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "selection";

/**
 * Trigger haptic feedback with specified intensity
 * @param type - Type of haptic feedback
 */
export const triggerHaptic = async (
  type: HapticFeedbackType = "light",
): Promise<void> => {
  try {
    switch (type) {
      case "light":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        break;
      case "warning":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        break;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "selection":
        await Haptics.selectionAsync();
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Haptics may not be available on all devices
    console.log("Haptic feedback not available:", error);
  }
};

/**
 * Haptic patterns for specific actions
 */
export const hapticPatterns = {
  // Button presses
  buttonPress: () => triggerHaptic("light"),
  buttonPressHeavy: () => triggerHaptic("medium"),

  // Actions
  saveVerse: () => triggerHaptic("success"),
  deleteItem: () => triggerHaptic("warning"),
  error: () => triggerHaptic("error"),

  // Gestures
  swipe: () => triggerHaptic("selection"),
  longPress: () => triggerHaptic("medium"),
  refresh: () => triggerHaptic("light"),

  // Completions
  taskComplete: () => triggerHaptic("success"),
  milestoneReached: async () => {
    // Double haptic for special moments
    await triggerHaptic("medium");
    setTimeout(() => triggerHaptic("success"), 100);
  },

  // Navigation
  tabSwitch: () => triggerHaptic("selection"),
  modalOpen: () => triggerHaptic("light"),
  modalClose: () => triggerHaptic("light"),

  // Interactions
  toggle: () => triggerHaptic("selection"),
  slider: () => triggerHaptic("selection"),
  picker: () => triggerHaptic("selection"),
};

/**
 * Custom haptic sequence
 * @param pattern - Array of haptic types with delays
 */
export const triggerHapticSequence = async (
  pattern: { type: HapticFeedbackType; delay: number }[],
): Promise<void> => {
  for (const { type, delay } of pattern) {
    await triggerHaptic(type);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Celebration haptic pattern
 * Used for achievements, completed readings, answered prayers
 */
export const celebrationHaptic = async (): Promise<void> => {
  await triggerHapticSequence([
    { type: "medium", delay: 50 },
    { type: "heavy", delay: 50 },
    { type: "success", delay: 0 },
  ]);
};
