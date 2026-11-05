import { headers } from "next/headers";
import { createAuth } from "@/lib/auth";

export const runtime = "nodejs";

let auth: ReturnType<typeof createAuth> | undefined;

function getAuth() {
  auth ??= createAuth();
  return auth;
}

export async function GET() {
  const requestHeaders = await headers();
  const authServer = getAuth();
  const session = await authServer.api.getSession({ headers: requestHeaders });

  if (!session) {
    return Response.json(
      { message: "Please sign in again to continue." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token = await authServer.api.getToken({ headers: requestHeaders });
  return Response.json(token, {
    headers: { "Cache-Control": "no-store" },
  });
}
