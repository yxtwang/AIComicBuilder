import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL || "file:./data/aicomic.db";
if (url.startsWith("file:") && !url.includes(":memory:")) {
  const dbPath = url.replace(/^file:/, "");
  if (dbPath) {
    const absolutePath = path.resolve(dbPath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  }
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url,
  },
});
