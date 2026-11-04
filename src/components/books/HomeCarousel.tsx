"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/types/book";

const spotlights = [
  { eyebrow: "Find a fresh perspective", title: "A new chapter is waiting.", note: "Wander the shelves and follow your curiosity." },
  { eyebrow: "Read a little differently", title: "Let a story surprise you.", note: "Discover a voice, a place, or an idea you haven't met yet." },
  { eyebrow: "Pass a good thing along", title: "Stories are better shared.", note: "Borrow a book, make it yours for a while, then return it." },
];

export default function HomeCarousel({ books }: { books: Book[] }) {
  const [active, setActive] = useState(0);
  const book = books.length ? books[active % books.length] : undefined;
  const item = spotlights[active % spotlights.length];
  const move = (offset: number) => setActive((current) => (current + offset + spotlights.length) % spotlights.length);

  return (
    <section aria-label="Featured reads" className="relative overflow-hidden rounded-[2rem] bg-[#00022E] text-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(194,149,107,.32),transparent_35%)]" />
      <div className="relative grid min-h-[440px] items-center gap-8 p-7 sm:p-12 lg:grid-cols-[1fr_.8fr] lg:p-16">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-[#e2bd98]">{item.eyebrow}</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl">{item.title}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">{item.note}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/books" className="btn border-0 bg-[#c2956b] text-[#16110d] hover:bg-[#ddb58e]">Browse Books</Link>
            {book && <Link href={`/books/${encodeURIComponent(book._id)}`} className="btn btn-outline border-white/40 text-white hover:bg-white hover:text-[#00022E]">Featured: {book.title}</Link>}
          </div>
          <div className="mt-10 flex items-center gap-2" aria-label={`Slide ${active + 1} of 3`}>
            {spotlights.map((slide, index) => (
              <button key={slide.title} aria-label={`Show slide ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-9 bg-[#c2956b]" : "w-2 bg-white/40"}`} />
            ))}
            <div className="ml-auto flex gap-2">
              <button className="btn btn-circle btn-sm btn-outline border-white/40 text-white" aria-label="Previous slide" onClick={() => move(-1)}><ArrowLeft size={16} /></button>
              <button className="btn btn-circle btn-sm btn-outline border-white/40 text-white" aria-label="Next slide" onClick={() => move(1)}><ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
        <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center sm:h-80">
          {book ? (
            <div className="relative h-full w-52 rotate-2 overflow-hidden rounded-lg border-4 border-white/15 bg-white shadow-2xl">
              <Image src={book.image} alt={`Cover of ${book.title}`} fill unoptimized sizes="208px" className="object-cover" />
            </div>
          ) : (
            <div className="grid h-56 w-44 -rotate-6 place-items-center rounded-lg border border-white/20 bg-[#c2956b] text-[#00022E] shadow-2xl">
              <div className="px-5 text-center"><BookOpen size={42} className="mx-auto mb-4" /><span className="font-serif text-2xl font-bold">Your next story</span></div>
            </div>
          )}
          <span className="absolute bottom-3 right-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#00022E] shadow">{book?.category || "A little library"}</span>
        </div>
      </div>
    </section>
  );
}
