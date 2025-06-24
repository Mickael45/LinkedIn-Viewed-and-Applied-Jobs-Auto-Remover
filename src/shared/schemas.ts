import { z } from "zod";

const SalarySchema = z.object({
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  period: z
    .enum(["yearly", "monthly", "weekly", "hourly"])
    .optional()
    .nullable(),
});

export const JobSummarySchema = z.object({
  mustHaves: z.array(z.string()),
  preferred: z.array(z.string()),
  requirements: z.array(z.string()),
  salary: z.preprocess((val) => {
    if (Array.isArray(val) && val.length === 0) return undefined;
    return val;
  }, SalarySchema.optional()),
});

export type JobSummaryData = z.infer<typeof JobSummarySchema>;
export type SalaryData = z.infer<typeof SalarySchema>;
