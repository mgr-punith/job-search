import { describe, expect, it } from "vitest";

import { profileSchema } from "@/features/profile/schemas/profile";

const validProfile = {
  name: "  Jordan Lee  ", headline: " Frontend developer ", phone: "+91 98765 43210",
  location: " Bengaluru ", country: " India ", timeZone: "Asia/Kolkata",
  yearsExperience: "3", experienceLevel: "MID", bio: " I build web applications. ",
  skillIds: ["skill-react", "skill-react"], preferredMarkets: ["TECHNOLOGY"],
  preferredWorkplaceTypes: ["REMOTE"],
};

describe("profileSchema", () => {
  it("normalizes fields, numbers and duplicate skill selections", () => {
    expect(profileSchema.parse(validProfile)).toMatchObject({
      name: "Jordan Lee", headline: "Frontend developer", country: "India",
      location: "Bengaluru", yearsExperience: 3, skillIds: ["skill-react"],
    });
  });

  it.each([
    { name: "J" }, { headline: "x".repeat(121) }, { bio: "x".repeat(2001) },
    { yearsExperience: -1 }, { yearsExperience: "invalid" }, { yearsExperience: 1.5 },
    { experienceLevel: "UNKNOWN" }, { phone: "abc" },
    { timeZone: "Not/AZone" }, { skillIds: Array.from({ length: 31 }, (_, i) => `skill-${i}`) },
  ])("rejects invalid profile values", (fields) => {
    expect(profileSchema.safeParse({ ...validProfile, ...fields }).success).toBe(false);
  });

  it("allows an incomplete profile without inventing optional information", () => {
    expect(profileSchema.parse({ ...validProfile, phone: "", headline: "", bio: "", timeZone: "", skillIds: [] })).toMatchObject({
      phone: "", headline: "", bio: "", timeZone: "", skillIds: [],
    });
  });

  it("accepts the UTC offsets already used by seeded candidates and jobs", () => {
    expect(profileSchema.safeParse({ ...validProfile, timeZone: "UTC-05:00" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...validProfile, timeZone: "UTC+05:30" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...validProfile, timeZone: "UTC+99:00" }).success).toBe(false);
  });
});
