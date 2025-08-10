import { z } from 'zod';

// Account deactivation schema
export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().max(500).optional()
});

// Account reactivation schema
export const reactivateAccountSchema = z.object({
  email: z.string().email('Invalid email format'),
  token: z.string().min(1, 'Token is required')
});

// Account deletion schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().min(1, 'Confirmation is required')
}).refine(data => data.password === data.confirmation, {
  message: 'Password confirmation does not match',
  path: ['confirmation']
});

// Validation helper types
export type DeactivateAccountData = z.infer<typeof deactivateAccountSchema>;
export type ReactivateAccountData = z.infer<typeof reactivateAccountSchema>;
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>; 