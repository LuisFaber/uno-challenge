import type { Context } from "hono";

export function ok(c: Context, data: unknown) {
  return c.json(data, 200);
}

export function created(c: Context, data: unknown) {
  return c.json(data, 201);
}

export function badRequest(c: Context, message: string) {
  return c.json({ error: message }, 400);
}

export function notFound(c: Context, message: string) {
  return c.json({ error: message }, 404);
}
