import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextUrl = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  return <div className="py-4"><AuthForm mode="register" nextUrl={nextUrl} /></div>;
}
