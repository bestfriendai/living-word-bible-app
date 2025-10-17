import Constants from "expo-constants";

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
}

/**
 * Validates that required environment variables are set
 * @returns EnvValidationResult with validation status and missing keys
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // Required keys
  const geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey;

  if (!geminiApiKey || geminiApiKey === "") {
    missingKeys.push("GEMINI_API_KEY");
    warnings.push(
      "⚠️ GEMINI_API_KEY is missing! AI features will not work. Get your key from: https://aistudio.google.com/app/apikey",
    );
  }

  // Optional but recommended keys
  const bibleApiKey = Constants.expoConfig?.extra?.bibleApiKey;

  if (!bibleApiKey || bibleApiKey === "your_bible_api_key_here") {
    warnings.push(
      "💡 BIBLE_API_KEY is not set. Some Bible translations may not be available. Get your key from: https://scripture.api.bible/signup",
    );
  }

  const isValid = missingKeys.length === 0;

  return {
    isValid,
    missingKeys,
    warnings,
  };
}

/**
 * Logs environment validation results to console
 */
export function logEnvValidation(): void {
  console.log("\n🔍 Validating environment variables...\n");

  const result = validateEnvironmentVariables();

  if (result.isValid) {
    console.log("✅ All required environment variables are set!\n");
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
export function getEnvErrorMessage(): string {
  const result = validateEnvironmentVariables();

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
