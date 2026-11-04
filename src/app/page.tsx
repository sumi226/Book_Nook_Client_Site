import Link from "next/link";
import { ArrowRight, BookHeart, HandHeart } from "lucide-react";
import HomeCarousel from "@/components/books/HomeCarousel";
import BookGrid from "@/components/books/BookGrid";
import { listBooks } from "@/lib/api";
import type { Book } from "@/types/book";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let books: Book[] = [];
  let loadError = "";
  try {
    books = (await listBooks(1, 6)).items;
  } catch (issue) {
    loadError = issue instanceof Error ? issue.message : "The library could not be reached.";
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      <HomeCarousel books={books} />
      <section aria-labelledby="newest-heading">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#e2bd98]">Fresh on the shelves</p><h2 id="newest-heading" className="mt-2 font-serif text-3xl font-bold sm:text-4xl">The newest six</h2></div>
          <Link href="/books" className="btn border-0 bg-[#c2956b] text-[#16110d] hover:bg-[#ddb58e]">See All Books <ArrowRight size={17} /></Link>
        </div>
        {loadError ? <p role="alert" className="rounded-xl border border-red-200/30 bg-red-950/30 p-5 text-red-100">Could not load live books: {loadError}</p> : <BookGrid books={books} />}
        <div className="mt-8 text-center"><Link href="/books" className="btn btn-outline border-white/50 text-white hover:bg-white hover:text-[#000080]">See All Books <ArrowRight size={17} /></Link></div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/15 bg-white/10 p-7 sm:p-9">
          <BookHeart className="text-[#e2bd98]" size={32} /><h2 className="mt-5 font-serif text-2xl font-bold">A community shelf</h2>
          <p className="mt-3 leading-7 text-white/75">Books have a way of bringing people together. Add a title from your own collection and give another reader a chance to discover it.</p>
          <Link href="/register" className="mt-5 inline-flex font-bold text-[#f0cda9] underline underline-offset-4">Share a book <ArrowRight size={16} className="ml-2" /></Link>
        </article>
        <article className="rounded-3xl border border-white/15 bg-white/10 p-7 sm:p-9">
          <HandHeart className="text-[#e2bd98]" size={32} /><h2 className="mt-5 font-serif text-2xl font-bold">Borrow, enjoy, return</h2>
          <p className="mt-3 leading-7 text-white/75">Find a story for the next few days, keep track of your borrowing period, and return books when you’re ready for another read.</p>
          <Link href="/books" className="mt-5 inline-flex font-bold text-[#f0cda9] underline underline-offset-4">Explore the shelves <ArrowRight size={16} className="ml-2" /></Link>
        </article>
      </section>
    </div>
  );
}
