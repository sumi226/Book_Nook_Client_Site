import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { getSafeNextUrl } from "@/lib/auth-navigation";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextUrl = getSafeNextUrl(params.next);
  return <div className="py-4"><AuthForm mode="register" nextUrl={nextUrl} /></div>;
}
