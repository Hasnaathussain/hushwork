import { z } from "zod";

const cleanText = (max: number) => z.string().trim().min(1).max(max);

export const signupSchema = z.object({
  name: cleanText(80),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128)
});

export const orderSchema = z.object({
  idempotencyKey: z.string().trim().min(16).max(128),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  shippingName: cleanText(100),
  shippingAddress: cleanText(180),
  city: cleanText(80),
  postalCode: cleanText(24),
  country: cleanText(80),
  items: z.array(z.object({ slug: z.string().trim().min(1).max(120), quantity: z.number().int().min(1).max(10) })).min(1).max(20)
});

export const assistantSchema = z.object({
  message: z.string().trim().min(2).max(600)
});

export const adminProductSchema = z.object({
  stock: z.number().int().min(0).max(1_000_000),
  active: z.boolean()
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"])
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32).max(128),
  password: z.string().min(8).max(128)
});
