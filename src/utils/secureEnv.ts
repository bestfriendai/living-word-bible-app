import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

/**
 * Secure environment variable management
 * Prevents API keys from being exposed in client bundles
 */
export class SecureEnvManager {
  private static instance: SecureEnvManager;
  private readonly GEMINI_KEY = "GEMINI_API_KEY";
  private readonly BIBLE_KEY = "BIBLE_API_KEY";

  private constructor() {}

  static getInstance(): SecureEnvManager {
    if (!SecureEnvManager.instance) {
      SecureEnvManager.instance = new SecureEnvManager();
    }
    return SecureEnvManager.instance;
  }

  /**
   * Securely retrieves API key with fallback to development environment
   * @param keyType - Type of API key to retrieve
   * @returns Promise<string> - The API key or empty string if not found
   */
  async getApiKey(keyType: "gemini" | "bible"): Promise<string> {
    const keyName = keyType === "gemini" ? this.GEMINI_KEY : this.BIBLE_KEY;

    try {
      // First try to get from secure storage (for production)
      const secureKey = await SecureStore.getItemAsync(keyName);
      if (secureKey && secureKey.trim() !== "") {
        return secureKey;
      }

      // Fallback to environment config (development only)
      if (__DEV__) {
        const envKey =
          Constants.expoConfig?.extra?.[
            keyType === "gemini" ? "geminiApiKey" : "bibleApiKey"
          ];
        if (
          envKey &&
          envKey.trim() !== "" &&
          envKey !== `your_${keyType}_api_key_here`
        ) {
          return envKey;
        }
      }

      return "";
    } catch (error) {
      console.warn(`⚠️ Failed to retrieve ${keyType} API key securely:`, error);
      return "";
    }
  }

  /**
   * Securely stores API key in device secure storage
   * @param keyType - Type of API key to store
   * @param apiKey - The API key to store
   * @returns Promise<boolean> - True if successful, false otherwise
   */
  async setApiKey(
    keyType: "gemini" | "bible",
    apiKey: string,
  ): Promise<boolean> {
    const keyName = keyType === "gemini" ? this.GEMINI_KEY : this.BIBLE_KEY;

    try {
      if (!apiKey || apiKey.trim() === "") {
        console.warn(`⚠️ Cannot store empty ${keyType} API key`);
        return false;
      }

      await SecureStore.setItemAsync(keyName, apiKey.trim());
      console.log(`✅ ${keyType} API key stored securely`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store ${keyType} API key securely:`, error);
      return false;
    }
  }

  /**
   * Validates if API key is properly formatted and not a placeholder
   * @param apiKey - The API key to validate
   * @param keyType - Type of API key for specific validation
   * @returns boolean - True if valid, false otherwise
   */
  static validateApiKey(apiKey: string, keyType: "gemini" | "bible"): boolean {
    if (!apiKey || apiKey.trim() === "") {
      return false;
    }

    const trimmedKey = apiKey.trim();

    // Check for placeholder values
    if (trimmedKey.includes("your_") || trimmedKey.includes("_here")) {
      return false;
    }

    // Gemini API key validation (starts with "AIza" and is typically 39 characters)
    if (keyType === "gemini") {
      return trimmedKey.startsWith("AIza") && trimmedKey.length >= 35;
    }

    // Bible API key validation (alphanumeric, typically 32 characters)
    if (keyType === "bible") {
      return /^[a-f0-9]{32}$/i.test(trimmedKey);
    }

    return false;
  }

  /**
   * Checks if API keys are available and valid
   * @returns Promise<{gemini: boolean, bible: boolean}> - Availability status
   */
  async checkApiKeysAvailability(): Promise<{
    gemini: boolean;
    bible: boolean;
  }> {
    const [geminiKey, bibleKey] = await Promise.all([
      this.getApiKey("gemini"),
      this.getApiKey("bible"),
    ]);

    return {
      gemini: SecureEnvManager.validateApiKey(geminiKey, "gemini"),
      bible: SecureEnvManager.validateApiKey(bibleKey, "bible"),
    };
  }
}

// Export singleton instance for convenience
export const secureEnv = SecureEnvManager.getInstance();
