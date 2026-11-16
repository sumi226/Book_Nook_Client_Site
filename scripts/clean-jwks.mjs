// One-off cleanup: removes stale JWKS rows that were encrypted with a
// previous BETTER_AUTH_SECRET. Private key encryption is now disabled, so
// leftover encrypted keys cannot be read and break /api/auth/token (500).
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (dotenv is not a dependency of this app).
const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not configured.");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const database = client.db(process.env.DB_NAME || "booknook");
  const result = await database.collection("jwks").deleteMany({});
  console.log(`Deleted ${result.deletedCount} stale JWKS row(s).`);
  process.exit(0);
} catch (error) {
  console.error("Cleanup failed:", error);
  process.exit(1);
}
