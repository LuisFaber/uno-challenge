import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
