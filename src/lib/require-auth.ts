import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/lib/auth";

export async function requireAuthenticatedUser(pathname: string) {
  const session = await createAuth().api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }
  return session.user;
}
