import { z } from "zod";

export const aiJobSchema = z.object({ jobId: z.string().trim().min(1).max(128) }).strict();
export const aiRequestSchema = aiJobSchema.extend({
  revision: z.iso.datetime(),
  answers: z.array(z.object({ skillId: z.string().min(1).max(128), known: z.boolean() }).strict()).max(50),
}).strict();
export const aiDraftSchema = z.object({
  headline: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(10).max(2000),
}).strict();
export const aiSaveSchema = aiRequestSchema.extend(aiDraftSchema.shape).strict();

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type AiDraft = z.infer<typeof aiDraftSchema>;
export type AiSkill = { id: string; name: string };
export type AiContext = {
  revision: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  experienceLevel: string;
  skills: AiSkill[];
  job: { id: string; title: string; skills: AiSkill[] };
};
export type AiSuggestion = AiDraft & { skills: AiSkill[]; learningSkills: AiSkill[] };
export type AiPreparation = { revision: string; jobTitle: string; missingSkills: AiSkill[]; currentHeadline: string; currentBio: string };
export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string };
