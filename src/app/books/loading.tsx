export default function BooksLoading() {
  return (
    <section role="status" aria-label="Loading the book collection">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-44 animate-pulse rounded bg-[#00022E]/10" />
        <div className="h-12 w-64 animate-pulse rounded bg-[#00022E]/10" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#00022E]/10" />
      </div>
      <div className="mb-7 h-12 max-w-xl animate-pulse rounded-xl bg-white" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10">
            <div className="aspect-[4/3] animate-pulse bg-[#00022E]/10" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#00022E]/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#00022E]/10" />
              <div className="h-4 w-28 animate-pulse rounded bg-[#00022E]/10" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading books.</span>
    </section>
  );
}
