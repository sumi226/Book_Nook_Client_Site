import "server-only";

import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { getPasswordValidationError } from "./password-policy";

const globalForMongo = globalThis as typeof globalThis & {
  bookNookAuthMongo?: MongoClient;
};

export function createAuth() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI must be configured for BookNook authentication.");
  }
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET must be configured for BookNook authentication.");
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be configured.");
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
    secret,
    database: mongodbAdapter(database, { client: mongoClient, transaction: false }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      autoSignIn: false,
    },
    socialProviders: googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== "/sign-up/email") {
          return;
        }
        const password = context.body?.password;
        const error = typeof password === "string"
          ? getPasswordValidationError(password)
          : "A password is required.";
        if (error) {
          throw new APIError("BAD_REQUEST", { message: error });
        }
      }),
    },
    plugins: [jwt()],
  });
}
