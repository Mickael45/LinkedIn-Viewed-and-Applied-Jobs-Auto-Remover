import type { BackgroundResponse } from "../shared/comms";
import { type JobSummaryData } from "../shared/schemas";
import { retry } from "../utils/retry";
import { callLlm } from "./llm-api";
import { jobSummaryExtractionPrompt } from "./prompts";

let requestCounter = 0;
let currentExtractionController: {
  id: number;
  controller: AbortController;
} | null = null;

export async function extractJobSummary(
  text: string,
  jobId: string
): Promise<BackgroundResponse<JobSummaryData>> {
  const requestId = ++requestCounter;

  if (currentExtractionController) {
    currentExtractionController.controller.abort();
  }

  const controller = new AbortController();
  currentExtractionController = { id: requestId, controller };
  const { signal } = controller;

  const extractionAttempt = async (): Promise<JobSummaryData> => {
    const prompt = jobSummaryExtractionPrompt.replace(
      "{{JOB_DESCRIPTION_TEXT}}",
      text
    );
    return callLlm(prompt, jobId, "json", signal);
  };

  try {
    const result = await retry(
      extractionAttempt,
      { retries: 2, delay: 500 },
      signal
    );
    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, error: "Aborted" };
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown extraction error occurred.";
    console.error(`[Extraction #${requestId}] CATASTROPHIC FAILURE:`, error);
    return { success: false, error: errorMessage };
  } finally {
    if (currentExtractionController?.id === requestId) {
      currentExtractionController = null;
    }
  }
}
