import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { initDatabase } from "./db/init.js";
import { contacts } from "./routes/contacts.routes.js";
import { leads } from "./routes/leads.routes.js";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

app.get("/", (c) => {
  return c.json({ message: "Mini CRM API running" });
});

app.route("/contacts", contacts);
app.route("/leads", leads);

async function main() {
  const maxAttempts = 10;
  const delayMs = 2000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initDatabase();
      break;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      console.log(`DB not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  const port = 3000;
  console.log(`Server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

main();
