import { z } from "zod";

export const SEVERITIES = ["critical", "warning", "info"] as const;
export const CATEGORIES = [
  "overflow",
  "text",
  "tap-target",
  "layout",
  "image",
  "contrast",
  "nav",
  "other",
] as const;

export const IssueSchema = z.object({
  device_id: z.string(),
  severity: z.enum(SEVERITIES),
  category: z.enum(CATEGORIES),
  area: z.string().describe("Page area: header / hero / content / nav / footer / etc."),
  description: z.string().describe("What's wrong, in one concise sentence."),
  suggestion: z.string().describe("A concrete fix in one sentence."),
});

export const AuditResultSchema = z.object({
  summary: z.string().describe("One-sentence overall verdict on cross-device quality."),
  issues: z.array(IssueSchema),
});

export type Issue = z.infer<typeof IssueSchema>;
export type AuditResult = z.infer<typeof AuditResultSchema>;
export type Severity = (typeof SEVERITIES)[number];
export type Category = (typeof CATEGORIES)[number];
