export const LlmProvider = {
  OLLAMA: "OLLAMA",
  GEMINI: "GEMINI",
} as const;

export type LlmProvider = (typeof LlmProvider)[keyof typeof LlmProvider];

export const ACTIVE_LLM_PROVIDER: LlmProvider = LlmProvider.GEMINI;
export const LINKEDIN_JOBS_URL_PREFIX = "https://www.linkedin.com/jobs/search/";

export const CACHE_PRUNE_ALARM_NAME = "cachePruneAlarm";
export const PRUNE_PERIOD_MINUTES = 60 * 24 * 90;

export const CACHE_MAX_ITEMS = 200;
export const DISMISSED_JOBS_MAX_ITEMS = 500;

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
export const CACHE_ITEM_TTL_MS = ONE_DAY_IN_MS;
export const DISMISSED_JOB_TTL_MS = 90 * ONE_DAY_IN_MS;

export const OLLAMA_CONFIG = {
  API_URL: "http://localhost:11434/api/chat",
  MODEL: "llama3.1",
};

export const GEMINI_CONFIG = {
  API_KEY: "",
  MODEL: "gemini-1.5-flash",
  get API_URL() {
    if (!this.API_KEY || this.API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error(
        "Error: Gemini API key is not configured in src/shared/config.ts"
      );
    }
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;
  },
};

if (
  ACTIVE_LLM_PROVIDER === LlmProvider.GEMINI &&
  (!GEMINI_CONFIG.API_KEY ||
    GEMINI_CONFIG.API_KEY === "YOUR_GEMINI_API_KEY_HERE")
) {
  console.error(
    "CRITICAL ALERT: Gemini API key is not set. The extension will fail."
  );
}
