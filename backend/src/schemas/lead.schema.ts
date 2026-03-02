import { z } from "zod";

const leadStatusEnum = z.enum([
  "novo",
  "contactado",
  "qualificado",
  "convertido",
  "perdido",
]);

export const leadSchema = z.object({
  contactId: z.string().min(1),
  name: z.string().min(2),
  company: z.string().min(2),
  status: leadStatusEnum,
});

export type LeadInput = z.infer<typeof leadSchema>;
