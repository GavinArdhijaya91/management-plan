import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254))

const loginPasswordSchema = z.string().min(8).max(72)

export const signupPasswordSchema = z
  .string()
  .min(10)
  .max(72)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/)

export const loginCredentialsSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const signupCredentialsSchema = loginCredentialsSchema.extend({
  fullName: z.string().trim().min(2).max(100),
  password: signupPasswordSchema,
})
