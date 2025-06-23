import { z } from "zod";
import { callLlm } from "./llm-api";
import { jobSummaryExtractionPrompt } from "./prompts";

const SalarySchema = z.object({
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  period: z.enum(["yearly", "monthly", "weekly", "hourly"]).optional(),
});

const JobSummarySchema = z.object({
  mustHaves: z.array(z.string()),
  preferred: z.array(z.string()),
  requirements: z.array(z.string()),
  salary: SalarySchema.optional(),
});

export type JobSummaryData = z.infer<typeof JobSummarySchema>;

export async function extractJobSummary(
  text: string
): Promise<JobSummaryData | null> {
  const prompt = jobSummaryExtractionPrompt.replace(
    "{{JOB_DESCRIPTION_TEXT}}",
    text
  );

  try {
    const llmResponse = await callLlm(prompt, "json");

    let jsonText = llmResponse.trim();
    const markdownMatch = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (markdownMatch) {
      jsonText = markdownMatch[1];
    }
    const parsedJson = JSON.parse(jsonText);

    const validation = JobSummarySchema.safeParse(parsedJson);

    if (!validation.success) {
      console.error(
        "Zod validation failed for Job Summary:",
        validation.error.errors
      );
      throw new Error(
        `LLM response failed schema validation: ${validation.error.message}`
      );
    }
    return validation.data;
  } catch (error) {
    console.error(
      "--- CATASTROPHIC FAILURE IN JOB SUMMARY EXTRACTION ---",
      error
    );
    return null;
  }
}
