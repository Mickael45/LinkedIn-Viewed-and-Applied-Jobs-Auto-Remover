export const jobSummaryExtractionPrompt = `
You are an expert Senior Tech Recruiter AI. Your task is to analyze the following job description and extract key information into a structured JSON object.

RULES:
1.  Analyze the provided job description TEXT ONLY. Do not infer or add information not present in the text.
2.  For "mustHaves", "preferred", and "requirements", provide a list of concise terms (2-4 words max).
3.  If a category has no relevant information, provide an empty array [].
4.  The 'salary' object should only be populated if a salary range, rate, or number is EXPLICITLY mentioned. Do not guess. If no salary is mentioned, omit the salary field entirely.

JSON OUTPUT STRUCTURE:
{
  "mustHaves": ["5+ years in Backend", "TypeScript", "AWS"],
  "preferred": ["React Native", "GraphQL", "CI/CD experience"],
  "requirements": ["US Citizen", "Bachelor's Degree", "On-site required"],
  "salary": { "minSalary": 150000, "maxSalary": 180000, "currency": "USD", "period": "yearly" }
}

JOB DESCRIPTION TEXT:
---
{{JOB_DESCRIPTION_TEXT}}
---
`;
