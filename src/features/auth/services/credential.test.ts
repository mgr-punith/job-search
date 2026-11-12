import { describe, expect, it } from "vitest";

import { verifyPassword } from "better-auth/crypto";

import { buildCredentialAccountData } from "@/features/auth/services/credential";

describe("buildCredentialAccountData", () => {
  it("builds a Better Auth credential account with a hashed password", async () => {
    const password = "JobSearchDemo123!";
    const account = await buildCredentialAccountData("candidate-user-id", password);

    expect(account).toMatchObject({
      accountId: "candidate-user-id",
      providerId: "credential",
      userId: "candidate-user-id",
    });
    expect(account.password).not.toBe(password);
    await expect(
      verifyPassword({ hash: account.password, password }),
    ).resolves.toBe(true);
  });
});
