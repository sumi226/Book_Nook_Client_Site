export default function HomeLoading() {
  return (
    <div className="space-y-16 sm:space-y-24" role="status" aria-label="Loading BookNook">
      <div className="min-h-[420px] animate-pulse rounded-[2rem] bg-[#00022E]/15 sm:min-h-[500px]" />

      <section aria-labelledby="loading-books-heading">
        <div className="mb-7 space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-[#00022E]/10" />
          <h2 id="loading-books-heading" className="font-serif text-3xl font-bold text-[#00022E] sm:text-4xl">Loading new arrivals</h2>
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#00022E]/10" />
        </div>
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
      </section>

      <div className="grid gap-6 md:grid-cols-2" aria-hidden="true">
        <div className="h-56 animate-pulse rounded-3xl bg-[#00022E]/10" />
        <div className="h-56 animate-pulse rounded-3xl bg-[#00022E]/10" />
      </div>
      <span className="sr-only">Loading the latest books.</span>
    </div>
  );
}
