import { secureEnv } from "./secureEnv";

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
}

/**
 * Validates that required environment variables are set securely
 * @returns Promise<EnvValidationResult> with validation status and missing keys
 */
export async function validateEnvironmentVariables(): Promise<EnvValidationResult> {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  try {
    // Check API key availability using secure manager
    const keyAvailability = await secureEnv.checkApiKeysAvailability();

    // Required keys - Gemini API
    if (!keyAvailability.gemini) {
      missingKeys.push("GEMINI_API_KEY");
      warnings.push(
        "⚠️ GEMINI_API_KEY is missing or invalid! AI features will not work. Get your key from: https://aistudio.google.com/app/apikey",
      );
    }

    // Optional but recommended keys - Bible API
    if (!keyAvailability.bible) {
      warnings.push(
        "💡 BIBLE_API_KEY is not set or invalid. Some Bible translations may not be available. Get your key from: https://scripture.api.bible/signup",
      );
    }

    const isValid = missingKeys.length === 0;

    return {
      isValid,
      missingKeys,
      warnings,
    };
  } catch (error) {
    console.error("❌ Error validating environment variables:", error);
    return {
      isValid: false,
      missingKeys: ["GEMINI_API_KEY", "BIBLE_API_KEY"],
      warnings: [
        "⚠️ Failed to validate API keys securely. Please check your configuration.",
      ],
    };
  }
}

/**
 * Logs environment validation results to console
 */
export async function logEnvValidation(): Promise<void> {
  console.log("\n🔍 Validating environment variables...\n");

  const result = await validateEnvironmentVariables();

  if (result.isValid) {
    console.log("✅ All required environment variables are set securely!\n");
  } else {
    console.error("❌ Environment validation failed!");
    console.error("Missing keys:", result.missingKeys.join(", "));
    console.error("\nPlease set the following in your .env file:\n");
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => console.warn(warning));
    console.log("");
  }
}

/**
 * Gets a user-friendly error message for missing environment variables
 */
export async function getEnvErrorMessage(): Promise<string> {
  const result = await validateEnvironmentVariables();

  if (result.isValid && result.warnings.length === 0) {
    return "";
  }

  let message = "";

  if (!result.isValid) {
    message += "⚠️ Missing Configuration\n\n";
    message += "The app is missing required API keys:\n";
    message += result.missingKeys.map((key) => `• ${key}`).join("\n");
    message += "\n\nPlease add them to your .env file to use all features.";
  }

  return message;
}
