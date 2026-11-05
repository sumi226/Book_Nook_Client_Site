import { AllBooksCatalog } from "@/components/books/LiveBookCatalog";

export const dynamic = "force-dynamic";

export default async function AllBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const parsedPage = Number(params.page || "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return <section>
    <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#A85335]">Browse the collection</p><h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">All Books</h1><p className="mt-3 text-[#514740]">Search the live BookNook catalog by title, author, or category.</p></div>
    <AllBooksCatalog page={page} />
  </section>;
}
