export default function BookDetailsLoading() {
  return (
    <article role="status" aria-label="Loading book details" className="mx-auto max-w-5xl">
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-[#00022E]/10" />
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-[.8fr_1.2fr]">
        <div className="min-h-80 animate-pulse bg-[#00022E]/10 md:min-h-[560px]" />
        <div className="space-y-5 p-7 sm:p-10">
          <div className="h-6 w-24 animate-pulse rounded-full bg-[#00022E]/10" />
          <div className="h-12 w-4/5 animate-pulse rounded bg-[#00022E]/10" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-[#00022E]/10" />
          <div className="h-16 animate-pulse rounded-xl bg-[#00022E]/10" />
          <div className="h-32 animate-pulse rounded bg-[#00022E]/10" />
          <div className="h-12 w-40 animate-pulse rounded bg-[#00022E]/10" />
        </div>
      </div>
      <span className="sr-only">Loading book details.</span>
    </article>
  );
}
