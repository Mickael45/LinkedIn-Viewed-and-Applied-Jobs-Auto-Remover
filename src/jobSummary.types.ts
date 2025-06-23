import { z } from "zod";

export const SalarySchema = z.object({
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  currency: z.string().optional(),
  period: z.enum(["yearly", "monthly", "weekly", "hourly"]).optional(),
});
export type SalaryData = z.infer<typeof SalarySchema>;

export const JobSummarySchema = z.object({
  mustHaves: z.array(z.string()),
  preferred: z.array(z.string()),
  requirements: z.array(z.string()),
  salary: SalarySchema.optional(),
});
export type JobSummaryData = z.infer<typeof JobSummarySchema>;

export interface UIManagerSelectors {
  jobDetailPanel: string;
  panelContainerAnchor: string;
  summaryContainerId: string;
}
