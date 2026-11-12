import { z } from "zod";

import { ExperienceLevel, Market, WorkplaceType } from "@/generated/prisma/enums";

const optionalText = (max: number) => z.string().trim().max(max).default("");

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(100),
  headline: optionalText(120),
  phone: optionalText(30).refine(
    (value) => !value || (/^[+\d () .-]+$/.test(value) && value.replace(/\D/g, "").length >= 7),
    "Enter a valid phone number",
  ),
  location: optionalText(100),
  country: optionalText(80),
  timeZone: optionalText(80).refine((value) => {
    if (!value) return true;
    if (/^UTC[+-](?:0\d|1[0-4]):[0-5]\d$/.test(value)) return true;
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid time zone, such as Asia/Kolkata"),
  yearsExperience: z.coerce.number().int("Use a whole number").min(0).max(60),
  experienceLevel: z.enum(ExperienceLevel),
  bio: optionalText(2000),
  skillIds: z.array(z.string().min(1).max(128)).max(30, "Choose up to 30 skills").default([]).transform((ids) => [...new Set(ids)]),
  preferredMarkets: z.array(z.enum(Market)).max(7).default([]).transform((values) => [...new Set(values)]),
  preferredWorkplaceTypes: z.array(z.enum(WorkplaceType)).max(3).default([]).transform((values) => [...new Set(values)]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
