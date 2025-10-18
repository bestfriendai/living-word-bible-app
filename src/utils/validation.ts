/**
 * Input validation utilities
 * Provides validation for user inputs throughout the app
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Sanitize user input by removing potentially dangerous characters
 * @param input - Raw user input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .substring(0, 10000); // Limit length
}

/**
 * Validation rules for different input types
 */
export const validators = {
  /**
   * Validate Bible verse reference
   * Valid formats: "John 3:16", "1 Corinthians 13:1-13", "Psalm 23"
   */
  verseReference(reference: string): ValidationResult {
    if (!reference || typeof reference !== "string") {
      return { isValid: false, error: "Reference is required" };
    }

    const trimmed = reference.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Reference cannot be empty" };
    }

    if (trimmed.length > 100) {
      return { isValid: false, error: "Reference is too long" };
    }

    // Allow letters, numbers, spaces, colons, hyphens, and commas
    const validPattern = /^[A-Za-z0-9\s:,\-\.]+$/;
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error: "Reference contains invalid characters",
      };
    }

    // Must contain at least one letter and one number
    if (!/[A-Za-z]/.test(trimmed) || !/\d/.test(trimmed)) {
      return {
        isValid: false,
        error:
          'Reference must include both book name and chapter (e.g., "John 3")',
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Bible search query
   */
  bibleQuery(query: string): ValidationResult {
    if (!query || typeof query !== "string") {
      return { isValid: false, error: "Search query is required" };
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: "Search query must be at least 2 characters",
      };
    }

    if (trimmed.length > 500) {
      return { isValid: false, error: "Search query is too long" };
    }

    return { isValid: true };
  },

  /**
   * Validate journal entry title
   */
  journalTitle(title: string): ValidationResult {
    if (!title || typeof title !== "string") {
      return { isValid: false, error: "Title is required" };
    }

    const trimmed = title.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Title cannot be empty" };
    }

    if (trimmed.length > 200) {
      return {
        isValid: false,
        error: "Title must be 200 characters or less",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate journal entry content
   */
  journalContent(content: string): ValidationResult {
    if (!content || typeof content !== "string") {
      return { isValid: false, error: "Content is required" };
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Content cannot be empty" };
    }

    if (trimmed.length > 10000) {
      return {
        isValid: false,
        error: "Content must be 10,000 characters or less",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate prayer request text
   */
  prayerRequest(text: string): ValidationResult {
    if (!text || typeof text !== "string") {
      return { isValid: false, error: "Prayer request is required" };
    }

    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Prayer request cannot be empty" };
    }

    if (trimmed.length < 3) {
      return {
        isValid: false,
        error: "Prayer request must be at least 3 characters",
      };
    }

    if (trimmed.length > 5000) {
      return {
        isValid: false,
        error: "Prayer request must be 5,000 characters or less",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate chat message
   */
  chatMessage(message: string): ValidationResult {
    if (!message || typeof message !== "string") {
      return { isValid: false, error: "Message is required" };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Message cannot be empty" };
    }

    if (trimmed.length > 2000) {
      return {
        isValid: false,
        error: "Message must be 2,000 characters or less",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate reading plan name
   */
  readingPlanName(name: string): ValidationResult {
    if (!name || typeof name !== "string") {
      return { isValid: false, error: "Plan name is required" };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Plan name cannot be empty" };
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: "Plan name must be 100 characters or less",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate verse text
   */
  verseText(text: string): ValidationResult {
    if (!text || typeof text !== "string") {
      return { isValid: false, error: "Verse text is required" };
    }

    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Verse text cannot be empty" };
    }

    if (trimmed.length > 5000) {
      return {
        isValid: false,
        error: "Verse text is too long",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate number is positive integer
   */
  positiveInteger(
    value: number,
    fieldName: string = "Value",
  ): ValidationResult {
    if (typeof value !== "number" || isNaN(value)) {
      return { isValid: false, error: `${fieldName} must be a number` };
    }

    if (!Number.isInteger(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be a whole number`,
      };
    }

    if (value < 1) {
      return { isValid: false, error: `${fieldName} must be positive` };
    }

    return { isValid: true };
  },

  /**
   * Validate array is not empty
   */
  nonEmptyArray<T>(array: T[], fieldName: string = "Array"): ValidationResult {
    if (!Array.isArray(array)) {
      return { isValid: false, error: `${fieldName} must be an array` };
    }

    if (array.length === 0) {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }

    return { isValid: true };
  },
};

/**
 * Validate multiple fields at once
 * @param validations - Array of validation results
 * @returns Combined validation result with all errors
 *
 * @example
 * ```typescript
 * const result = validateAll([
 *   validators.journalTitle(title),
 *   validators.journalContent(content)
 * ]);
 *
 * if (!result.isValid) {
 *   alert(result.error);
 * }
 * ```
 */
export function validateAll(validations: ValidationResult[]): ValidationResult {
  const errors = validations.filter((v) => !v.isValid).map((v) => v.error);

  if (errors.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: errors.filter((e): e is string => !!e).join(". "),
  };
}

/**
 * Validate and sanitize input in one step
 * @param input - Raw user input
 * @param validator - Validation function
 * @returns Object with validation result and sanitized input
 *
 * @example
 * ```typescript
 * const { isValid, error, value } = validateAndSanitize(
 *   userInput,
 *   validators.journalTitle
 * );
 *
 * if (!isValid) {
 *   alert(error);
 *   return;
 * }
 *
 * // Use sanitized value
 * saveToDatabase(value);
 * ```
 */
export function validateAndSanitize(
  input: string,
  validator: (input: string) => ValidationResult,
): ValidationResult & { value: string } {
  const sanitized = sanitizeInput(input);
  const validation = validator(sanitized);

  return {
    ...validation,
    value: sanitized,
  };
}

/**
 * SQL injection prevention - escape special characters
 * Note: This is a last resort. Always use parameterized queries!
 */
export function escapeSql(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, "");
}

/**
 * Check if string contains suspicious patterns
 */
export function containsSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}
