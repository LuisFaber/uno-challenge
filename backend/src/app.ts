import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { initDatabase } from "./db/init.js";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Mini CRM API running" });
});

async function main() {
  await initDatabase();
  const port = 3000;
  console.log(`Server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

main();
