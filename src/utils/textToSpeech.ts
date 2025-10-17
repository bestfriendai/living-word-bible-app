import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onDone?: () => void;
  onStart?: () => void;
  onError?: (error: Error) => void;
}

class TextToSpeechService {
  private isSpeaking = false;
  private currentText = "";

  /**
   * Speak text with customizable options
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const {
      language = "en-US",
      pitch = 1.0,
      rate = 0.9,
      voice,
      onDone,
      onStart,
      onError,
    } = options;

    try {
      // Stop any current speech
      await this.stop();

      this.currentText = text;
      this.isSpeaking = true;

      // Haptic feedback when starting
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Configure speech options
      const speechOptions: Speech.SpeechOptions = {
        language,
        pitch,
        rate,
        voice,
        onStart: () => {
          onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          this.currentText = "";
          onDone?.();
        },
        onStopped: () => {
          this.isSpeaking = false;
          this.currentText = "";
        },
        onError: (error: any) => {
          this.isSpeaking = false;
          this.currentText = "";
          onError?.(
            new Error(
              typeof error === "object" && error.error
                ? error.error
                : "Speech error",
            ),
          );
        },
      };

      // Start speaking
      Speech.speak(text, speechOptions);
    } catch (error) {
      this.isSpeaking = false;
      this.currentText = "";
      onError?.(
        error instanceof Error ? error : new Error("Failed to speak text"),
      );
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
      this.currentText = "";
    }
  }

  /**
   * Pause current speech
   */
  async pause(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.pause();
    }
  }

  /**
   * Resume paused speech
   */
  async resume(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current text being spoken
   */
  getCurrentText(): string {
    return this.currentText;
  }

  /**
   * Get available voices for a language
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    return await Speech.getAvailableVoicesAsync();
  }

  /**
   * Check if speech synthesis is available
   */
  async isSpeechAvailable(): Promise<boolean> {
    try {
      const voices = await this.getAvailableVoices();
      return voices.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Speak a Bible verse with natural pauses
   */
  async speakBibleVerse(
    reference: string,
    text: string,
    options: TTSOptions = {},
  ): Promise<void> {
    // Add a natural pause before the verse text
    const verseText = `${reference}. ${text}`;

    await this.speak(verseText, {
      ...options,
      rate: 0.85, // Slightly slower for better comprehension
      pitch: 1.0,
    });
  }

  /**
   * Speak devotional content with emphasis
   */
  async speakDevotional(
    title: string,
    verseReference: string,
    verseText: string,
    reflection: string,
    options: TTSOptions = {},
  ): Promise<void> {
    const devotionalText = `
      ${title}.

      Today's verse is from ${verseReference}.
      ${verseText}

      Reflection.
      ${reflection}
    `;

    await this.speak(devotionalText, {
      ...options,
      rate: 0.8, // Slower for devotional content
      pitch: 1.0,
    });
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();
