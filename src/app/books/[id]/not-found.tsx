import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function BookNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-[#00022E]/10 bg-white p-8 text-center text-slate-900 shadow-lg sm:p-12">
      <BookOpen className="mx-auto text-[#A85335]" size={42} aria-hidden="true" />
      <h1 className="mt-5 font-serif text-3xl font-bold">Book not found</h1>
      <p className="mt-4 text-slate-600">
        This book may have been removed from the library, or the link is incorrect.
      </p>
      <Link
        href="/books"
        className="btn mt-7 border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]"
      >
        <ArrowLeft size={17} aria-hidden="true" /> Back to all books
      </Link>
    </section>
  );
}
