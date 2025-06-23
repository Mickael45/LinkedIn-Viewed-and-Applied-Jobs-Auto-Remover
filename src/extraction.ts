import { z } from "zod";
import { callLlm } from "./llm-api";
import { jobSummaryExtractionPrompt } from "./prompts";
import { retry } from "./retry";

let requestCounter = 0;
let currentExtractionController: {
  id: number;
  controller: AbortController;
} | null = null;

const SalarySchema = z.object({
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  period: z
    .enum(["yearly", "monthly", "weekly", "hourly"])
    .optional()
    .nullable(),
});

const JobSummarySchema = z.object({
  mustHaves: z.array(z.string()),
  preferred: z.array(z.string()),
  requirements: z.array(z.string()),
  salary: z.preprocess((val) => {
    if (Array.isArray(val) && val.length === 0) {
      return undefined;
    }
    return val;
  }, SalarySchema.optional()),
});

export type JobSummaryData = z.infer<typeof JobSummarySchema>;

export async function extractJobSummary(
  text: string
): Promise<JobSummaryData | null> {
  const requestId = ++requestCounter;

  if (currentExtractionController) {
    console.log(
      `[Request #${requestId}] New request received. Aborting previous request #${currentExtractionController.id}.`
    );
    currentExtractionController.controller.abort();
  }

  const controller = new AbortController();
  currentExtractionController = { id: requestId, controller: controller };
  const signal = controller.signal;

  console.log(`[Request #${requestId}] Starting extraction.`);

  const extractionAttempt = async (): Promise<JobSummaryData> => {
    const prompt = jobSummaryExtractionPrompt.replace(
      "{{JOB_DESCRIPTION_TEXT}}",
      text
    );

    const llmResponse = await callLlm(prompt, "json", signal);

    if (signal.aborted)
      throw new DOMException("Aborted after LLM call", "AbortError");

    let jsonText = llmResponse.trim();
    const markdownMatch = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (markdownMatch) {
      jsonText = markdownMatch[1];
    }

    const parsedJson = JSON.parse(jsonText);
    const validation = JobSummarySchema.safeParse(parsedJson);

    if (!validation.success) {
      throw new Error(
        `LLM response failed schema validation: ${validation.error.message}`
      );
    }
    return validation.data;
  };

  try {
    const result = await retry(
      extractionAttempt,
      { retries: 3, delay: 500 },
      signal
    );
    console.log(`[Request #${requestId}] Extraction successful.`);
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log(
        `[Request #${requestId}] Extraction was successfully aborted.`
      );
    } else {
      console.error(
        `[Request #${requestId}] --- CATASTROPHIC FAILURE IN JOB SUMMARY EXTRACTION AFTER ALL RETRIES ---`,
        error
      );
    }
    return null;
  } finally {
    console.log(`[Request #${requestId}] Finalizing.`);
    if (currentExtractionController?.id === requestId) {
      currentExtractionController = null;
    }
  }
}
