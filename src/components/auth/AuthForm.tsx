"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { getPasswordValidationError } from "@/lib/password-policy";
import toast from "react-hot-toast";

export default function AuthForm({ mode, nextUrl }: { mode: "login" | "register"; nextUrl?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const registering = mode === "register";
  const alternateHref = `${registering ? "/login" : "/register"}${nextUrl && nextUrl !== "/" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (registering) {
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        setError(passwordError);
        toast.error(passwordError);
        setBusy(false);
        return;
      }
    }

    try {
      const result = registering
        ? await authClient.signUp.email({
            name: String(formData.get("name") || "").trim(),
            email,
            password,
            image: String(formData.get("image") || "").trim() || undefined,
          })
        : await authClient.signIn.email({ email, password, callbackURL: nextUrl || "/" });
      if (result.error) {
        const message = result.error.message || "Authentication failed. Please try again.";
        setError(message);
        toast.error(message);
      } else if (registering) {
        toast.success("Account created successfully. Please sign in.");
        const loginUrl = nextUrl && nextUrl !== "/"
          ? `/login?next=${encodeURIComponent(nextUrl)}`
          : "/login";
        router.replace(loginUrl);
        router.refresh();
      } else {
        toast.success("Signed in successfully. Welcome back!");
        router.replace(nextUrl || "/");
        router.refresh();
      }
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Authentication failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setBusy(true);
    try {
      toast.loading("Connecting to Google…", { id: "google-auth" });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: nextUrl || "/",
      });
      if (result.error) {
        toast.dismiss("google-auth");
        const message = result.error.message || "Google sign-in failed. Please try again.";
        setError(message);
        toast.error(message);
      } else {
        toast.success("Redirecting to Google…", { id: "google-auth" });
      }
    } catch (issue) {
      toast.dismiss("google-auth");
      const message = issue instanceof Error ? issue.message : "Google sign-in failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl bg-white p-7 text-slate-900 shadow-2xl sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Welcome to BookNook</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">{registering ? "Register" : "Login"}</h1>
      <p className="mt-3 text-slate-600">{registering ? "Join the community and start sharing your shelves." : "Sign in to manage your books and borrows."}</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        {registering && <label className="form-control gap-2"><span className="font-semibold">Name</span><input className="input input-bordered w-full" name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>}
        {registering && <label className="form-control gap-2"><span className="font-semibold">Photo URL <span className="font-normal text-slate-500">(optional)</span></span><input className="input input-bordered w-full" name="image" type="url" autoComplete="url" placeholder="https://…" /></label>}
        <label className="form-control gap-2"><span className="font-semibold">Email</span><input className="input input-bordered w-full" name="email" type="email" autoComplete="email" required /></label>
        <label className="form-control gap-2"><span className="font-semibold">Password</span><input className="input input-bordered w-full" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 6 : undefined} required /></label>
        {registering && <p className="-mt-3 text-sm text-slate-600">Use at least 6 characters, including an uppercase and a lowercase letter.</p>}
        {!registering && <p className="-mt-3 text-right text-sm text-slate-500">Forgot password? Password reset is not enabled.</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" className="btn w-full border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busy}>{busy ? "Please wait…" : registering ? "Register" : "Login"}</button>
      </form>
      <div className="my-6 flex items-center gap-4 text-sm text-slate-500"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <button type="button" className="btn btn-outline w-full" onClick={signInWithGoogle} disabled={busy}>{busy ? "Please wait…" : "Continue with Google"}</button>
      <p className="mt-6 text-center text-sm text-slate-600">
        {registering ? "Already have an account? " : "New to BookNook? "}
        <Link className="font-bold text-[#A85335] underline" href={alternateHref}>{registering ? "Sign in" : "Create an account"}</Link>
      </p>
    </section>
  );
}
