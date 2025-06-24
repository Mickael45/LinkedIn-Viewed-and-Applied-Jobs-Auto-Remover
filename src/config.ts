export const LlmProvider = {
  OLLAMA: "OLLAMA",
  GEMINI: "GEMINI",
} as const;

export const DATA_TTL = 1000 * 60 * 60 * 24 * 90;
export const DATA_MAX_SIZE = 1000;
export const NINETY_DAYS_IN_MS = 1 * 1000;
export const CACHE_MAX_SIZE = 1000;
export const CACHE_PRUNE_ALARM_NAME = "llmCachePruneAlarm";

export type LlmProvider = (typeof LlmProvider)[keyof typeof LlmProvider];

export const ACTIVE_LLM_PROVIDER: LlmProvider = LlmProvider.GEMINI;

export const OLLAMA_CONFIG = {
  API_URL: "http://localhost:11434/api/chat",
  MODEL: "llama3.1",
};

export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyDCyhkrBUlyuCVop1qkyJ5LRL3gKXVlGi0",
  MODEL: "gemini-1.5-pro",
  get API_URL() {
    if (!this.API_KEY) {
      throw new Error("GEMINI API key is not configured");
    }
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;
  },
};

if (
  ACTIVE_LLM_PROVIDER === LlmProvider.GEMINI &&
  GEMINI_CONFIG.API_KEY === "YOUR_GEMINI_API_KEY_HERE"
) {
  console.error(
    "CRITICAL: Gemini API key is not set in src/config.ts. The application will not work."
  );
}
