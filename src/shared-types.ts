export const LlmTaskType = {
  EXTRACT_JOB_SUMMARY: "llm/extractJobSummary",
} as const;

export type LlmTaskType = (typeof LlmTaskType)[keyof typeof LlmTaskType];

export type LlmTaskRequest = {
  type: typeof LlmTaskType.EXTRACT_JOB_SUMMARY;
  text: string;
};

export const CommandType = {
  RESET_PROCESSOR: "command/resetProcessor",
  EXTRACT_JOB_CONTENT: "command/extractJobContent",
} as const;

export type CommandMessage =
  | { type: typeof CommandType.RESET_PROCESSOR; url: string }
  | { type: typeof CommandType.EXTRACT_JOB_CONTENT };
