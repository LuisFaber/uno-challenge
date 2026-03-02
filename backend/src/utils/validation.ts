import type { z } from "zod";

export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  const firstMessage = parsed.error.issues[0]?.message ?? "Invalid data";
  return { success: false, error: firstMessage };
}
