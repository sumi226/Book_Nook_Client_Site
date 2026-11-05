"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BookDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Book details failed to load.", error);
    toast.error("We couldn’t load this book. Check the API connection and try again.");
  }, [error]);

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg sm:p-12">
      <h1 className="font-serif text-3xl font-bold text-[#00022E]">Book details are unavailable</h1>
      <p role="alert" className="mt-4 text-slate-600">We couldn’t load this book. Check the API connection and try again.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn border-0 bg-[#C87958] text-[#00022E]" onClick={reset}><RefreshCw size={17} /> Try again</button>
        <Link href="/books" className="btn btn-outline">Browse all books</Link>
      </div>
    </section>
  );
}
