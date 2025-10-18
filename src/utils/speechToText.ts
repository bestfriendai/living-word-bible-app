import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export interface STTOptions {
  lang?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
  continuous?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

class SpeechToTextService {
  private isListening = false;
  private currentTranscript = "";

  /**
   * Start speech recognition
   */
  async start(options: STTOptions = {}): Promise<void> {
    const {
      lang = "en-US",
      interimResults = true,
      maxAlternatives = 1,
      continuous = false,
    } = options;

    try {
      // Request permissions
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        throw new Error("Microphone permission not granted");
      }

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start recognition
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults,
        maxAlternatives,
        continuous,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: [
          "Bible",
          "Jesus",
          "God",
          "prayer",
          "verse",
          "scripture",
          "devotional",
        ],
      });

      this.isListening = true;
    } catch (error) {
      this.isListening = false;
      throw error;
    }
  }

  /**
   * Stop speech recognition
   */
  async stop(): Promise<void> {
    if (this.isListening) {
      ExpoSpeechRecognitionModule.stop();
      this.isListening = false;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  /**
   * Abort speech recognition
   */
  async abort(): Promise<void> {
    if (this.isListening) {
      ExpoSpeechRecognitionModule.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<string[]> {
    try {
      const result = await ExpoSpeechRecognitionModule.getSupportedLocales?.({
        androidRecognitionServicePackage: undefined,
      });
      return result?.locales || [];
    } catch (error) {
      console.error("Error getting supported languages:", error);
      return ["en-US"];
    }
  }

  /**
   * Check if speech recognition is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const available = await ExpoSpeechRecognitionModule.getStateAsync?.();
      // The state can be "inactive", "starting", "recognizing", "stopping"
      // If we get a state back, speech recognition is available
      return available !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
  }> {
    try {
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      return result;
    } catch {
      return { granted: false, canAskAgain: true };
    }
  }
}

// Export singleton instance
export const sttService = new SpeechToTextService();

/**
 * React hook for speech recognition
 */
export function useSpeechToText(options: STTOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  // Listen to speech recognition events
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    options.onEnd?.();
  });

  useSpeechRecognitionEvent("result", (event) => {
    const results = event.results;
    if (results && results.length > 0) {
      const result = results[0];
      const transcriptText = result.transcript;
      // Check if isFinal exists, default to false if not
      const isFinal = "isFinal" in result ? result.isFinal : false;

      if (isFinal) {
        setTranscript(transcriptText);
        setInterimTranscript("");
        options.onResult?.(transcriptText, true);
      } else {
        setInterimTranscript(transcriptText);
        options.onResult?.(transcriptText, false);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    const errorObj = new Error(event.error || "Speech recognition error");
    setIsListening(false);
    options.onError?.(errorObj);
  });

  const startListening = async () => {
    try {
      setTranscript("");
      setInterimTranscript("");
      await sttService.start(options);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to start listening");
      options.onError?.(error);
    }
  };

  const stopListening = async () => {
    await sttService.stop();
  };

  const resetTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
