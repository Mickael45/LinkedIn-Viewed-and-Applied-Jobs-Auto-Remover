export const LlmTaskType = {
  EXTRACT_JOB_SUMMARY: "llm/extractJobSummary",
} as const;

export type LlmTaskType = (typeof LlmTaskType)[keyof typeof LlmTaskType];

export type LlmTaskRequest = {
  type: typeof LlmTaskType.EXTRACT_JOB_SUMMARY;
  text: string;
};

export type BackgroundResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const CommandType = {
  URL_UPDATED: "command/urlUpdated",
  // THE FIX: This is now a direct request that expects a response.
  GET_CURRENT_JOB_ID: "command/getCurrentJobId",
} as const;

export type CommandMessage =
  | { type: typeof CommandType.URL_UPDATED; jobId: string | null }
  | { type: typeof CommandType.GET_CURRENT_JOB_ID };
