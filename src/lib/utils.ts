import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Wraps an async function with exponential backoff retry logic.
 * Useful for handling transient 503 / 429 errors from LLM APIs.
 */
export async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      console.warn(`[Retry ${attempt}/${maxRetries}] API Call failed:`, error?.message || error);
      
      // If it's a known non-transient error, we could break early here.
      // But for 503/429/fetch errors, we should always retry.
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Retry failed.");
}
