/**
 * Network retry utility with exponential backoff
 * Handles transient network errors gracefully
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.message?.includes("Network request failed")) return true;
    if (error?.message?.includes("timeout")) return true;
    if (error?.status >= 500 && error?.status < 600) return true;
    if (error?.name === "AbortError") return true;
    return false;
  },
  onRetry: () => {},
};

/**
 * Execute a function with automatic retry on failure
 * Uses exponential backoff to avoid overwhelming the server
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise with the function result
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   async () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, initialDelayMs: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const baseDelay =
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
      const delay = Math.min(baseDelay, opts.maxDelayMs);

      // Add jitter to avoid thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const finalDelay = delay + jitter;

      console.warn(
        `[Retry] Attempt ${attempt}/${opts.maxRetries} failed. Retrying in ${Math.round(finalDelay)}ms...`,
        error,
      );

      // Notify caller of retry
      opts.onRetry(attempt, error);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  // All retries exhausted
  console.error(
    `[Retry] All ${opts.maxRetries} attempts failed. Giving up.`,
    lastError,
  );
  throw lastError;
}

/**
 * Wrap a fetch call with retry logic
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions,
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, init);

      // Consider 5xx errors as retryable
      if (response.status >= 500) {
        const error = new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
        (error as any).status = response.status;
        throw error;
      }

      return response;
    },
    {
      ...retryOptions,
      shouldRetry: (error) => {
        // Custom retry logic for fetch
        if (error?.status === 429) return true; // Rate limit
        if (error?.status >= 500 && error?.status < 600) return true; // Server errors
        if (retryOptions?.shouldRetry) {
          return retryOptions.shouldRetry(error);
        }
        return defaultOptions.shouldRetry(error);
      },
    },
  );
}

/**
 * Create a retryable version of any async function
 *
 * @example
 * ```typescript
 * const retryableGetVerse = makeRetryable(bibleApi.getVerse);
 * const verse = await retryableGetVerse('John 3:16');
 * ```
 */
export function makeRetryable<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  retryOptions?: RetryOptions,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), retryOptions);
}
