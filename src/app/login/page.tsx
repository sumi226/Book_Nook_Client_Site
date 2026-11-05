import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { getSafeNextUrl } from "@/lib/auth-navigation";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextUrl = getSafeNextUrl(params.next);
  return <div className="py-4"><AuthForm mode="login" nextUrl={nextUrl} /></div>;
}
