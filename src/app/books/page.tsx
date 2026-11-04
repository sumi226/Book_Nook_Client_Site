import Link from "next/link";
import BookSearchGrid from "@/components/books/BookSearchGrid";
import { listBooks } from "@/lib/api";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

export default async function AllBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const parsedPage = Number(params.page || "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let result: Awaited<ReturnType<typeof listBooks>> | null = null;
  let error = "";
  try {
    result = await listBooks(page, PAGE_SIZE);
  } catch (issue) {
    error = issue instanceof Error ? issue.message : "The library could not be reached.";
  }

  return <section>
    <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Browse the collection</p><h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">All Books</h1><p className="mt-3 text-[#514740]">Search the live BookNook catalog by title, author, or category.</p></div>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">Could not load live books: {error}</p> : <>
      <BookSearchGrid books={result?.items || []} />
      {result && result.pagination.totalPages > 1 && <nav aria-label="Book pages" className="mt-8 flex justify-center gap-3">
        {page > 1 && <Link className="btn btn-outline border-[#00022E]/30 text-[#00022E]" href={`/books?page=${page - 1}`}>Previous</Link>}
        <span className="self-center text-sm text-[#514740]">Page {page} of {result.pagination.totalPages}</span>
        {page < result.pagination.totalPages && <Link className="btn btn-outline border-[#00022E]/30 text-[#00022E]" href={`/books?page=${page + 1}`}>Next</Link>}
      </nav>}
    </>}
  </section>;
}
