"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode, nextUrl }: { mode: "login" | "register"; nextUrl?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    try {
      const result = registering
        ? await authClient.signUp.email({
            name: String(formData.get("name") || "").trim(),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Authentication failed. Please try again.");
      } else {
        router.replace(nextUrl || "/");
        router.refresh();
      }
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl bg-white p-7 text-slate-900 shadow-2xl sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-[#705035]">Welcome to BookNook</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">{registering ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-3 text-slate-600">{registering ? "Join the community and start sharing your shelves." : "Sign in to manage your books and borrows."}</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        {registering && <label className="form-control gap-2"><span className="font-semibold">Name</span><input className="input input-bordered w-full" name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>}
        <label className="form-control gap-2"><span className="font-semibold">Email</span><input className="input input-bordered w-full" name="email" type="email" autoComplete="email" required /></label>
        <label className="form-control gap-2"><span className="font-semibold">Password</span><input className="input input-bordered w-full" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={8} required /></label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" className="btn w-full border-0 bg-[#c2956b] text-[#16110d] hover:bg-[#ddb58e]" disabled={busy}>{busy ? "Please wait…" : registering ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        {registering ? "Already have an account? " : "New to BookNook? "}
        <Link className="font-bold text-[#60452e] underline" href={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create an account"}</Link>
      </p>
    </section>
  );
}
