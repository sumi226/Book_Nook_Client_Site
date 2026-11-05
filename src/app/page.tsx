import Link from "next/link";
import { ArrowRight, BookHeart, HandHeart } from "lucide-react";
import HomeCarousel from "@/components/books/HomeCarousel";
import { HomeBookCards } from "@/components/books/LiveBookCatalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <HomeCarousel />
      <section aria-labelledby="newest-heading">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Fresh on the shelves</p>
          <h2 id="newest-heading" className="mt-2 font-serif text-3xl font-bold text-[#00022E] sm:text-4xl">New Arrivals</h2>
          <p className="mt-2 text-[#514740]">The latest stories added to our community library.</p>
        </div>
        <HomeBookCards />
        <div className="mt-8 text-center">
          <Link href="/books" className="btn border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]">
            See All Books <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
      <section aria-label="About borrowing and sharing" className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-[#00022E]/10 bg-white p-7 shadow-sm sm:p-9">
          <BookHeart className="text-[#A85335]" size={32} />
          <h2 className="mt-5 font-serif text-2xl font-bold text-[#00022E]">A community shelf</h2>
          <p className="mt-3 leading-7 text-[#514740]">Books have a way of bringing people together. Add a title from your own collection and give another reader a chance to discover it.</p>
          <Link href="/register" className="mt-5 inline-flex font-bold text-[#A85335] underline underline-offset-4">Share a book <ArrowRight size={16} className="ml-2" /></Link>
        </article>
        <article className="rounded-3xl border border-[#00022E]/10 bg-white p-7 shadow-sm sm:p-9">
          <HandHeart className="text-[#A85335]" size={32} />
          <h2 className="mt-5 font-serif text-2xl font-bold text-[#00022E]">Borrow, enjoy, return</h2>
          <p className="mt-3 leading-7 text-[#514740]">Find a story for the next few days, keep track of your borrowing period, and return books when you’re ready for another read.</p>
          <Link href="/books" className="mt-5 inline-flex font-bold text-[#A85335] underline underline-offset-4">Explore the shelves <ArrowRight size={16} className="ml-2" /></Link>
        </article>
      </section>
    </div>
  );
}
