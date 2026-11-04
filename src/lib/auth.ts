import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  bookNookAuthMongo?: MongoClient;
};

export function createAuth() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI must be configured for BookNook authentication.");
  }

  const mongoClient =
    globalForMongo.bookNookAuthMongo ??
    new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
  if (process.env.NODE_ENV !== "production") {
    globalForMongo.bookNookAuthMongo = mongoClient;
  }

  const database = mongoClient.db(process.env.DB_NAME || "booknook");
  return betterAuth({
    appName: "BookNook",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(database, { client: mongoClient, transaction: false }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [jwt()],
  });
}
