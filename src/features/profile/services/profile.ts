import type { ProfileInput } from "@/features/profile/schemas/profile";
import { db } from "@/lib/db";

export async function saveCandidateProfile(userId: string, input: ProfileInput) {
  const { name, skillIds, ...fields } = input;
  const skillCount = await db.skill.count({ where: { id: { in: skillIds } } });
  if (skillCount !== skillIds.length) throw new Error("Invalid skill selection");

  const data = {
    ...fields,
    headline: fields.headline || null,
    phone: fields.phone || null,
    location: fields.location || null,
    country: fields.country || null,
    timeZone: fields.timeZone || null,
    bio: fields.bio || null,
  };
  const skills = skillIds.map((skillId) => ({ skill: { connect: { id: skillId } } }));

  // Nested writes keep the name, profile and skill selection in one transaction.
  await db.user.update({
    where: { id: userId },
    data: {
      name,
      profile: {
        upsert: {
          create: { ...data, skills: { create: skills } },
          update: { ...data, skills: { deleteMany: {}, create: skills } },
        },
      },
    },
    select: { id: true },
  });
}
