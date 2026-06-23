import { z } from "zod";

export const contactInfoSchema = z.object({
  customerName: z.string().trim().min(1, "O nome é obrigatório."),
  customerPhone: z
    .string()
    .trim()
    .min(9, "Número de telefone inválido.")
    .regex(/^[0-9+\s]+$/, "Número de telefone inválido."),
  customerEmail: z.string().trim().email("Email inválido."),
  notes: z.string().trim().max(500).optional(),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
