import { hashPassword } from "better-auth/crypto";

export async function buildCredentialAccountData(
  userId: string,
  password: string,
) {
  return {
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(password),
  };
}
