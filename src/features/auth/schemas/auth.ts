import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email is too long");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const signupCredentialsSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: emailSchema,
    password: passwordSchema,
});

export const signupSchema = signupCredentialsSchema
  .extend({
    passwordConfirmation: z.string().max(128, "Password is too long"),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password")
    .max(128, "Password must be at most 128 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
