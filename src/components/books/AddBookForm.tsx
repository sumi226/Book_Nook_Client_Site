"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBook } from "@/lib/api";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function AddBookForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const book = await createBook({
        title: String(data.get("title") || "").trim(),
        author: String(data.get("author") || "").trim(),
        category: String(data.get("category") || ""),
        image: String(data.get("image") || "").trim(),
        description: String(data.get("description") || "").trim(),
        totalCopies: Number(data.get("totalCopies")),
      });
      router.push(`/books/${encodeURIComponent(book._id)}`);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "The book could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl bg-white p-7 text-slate-900 shadow-2xl sm:p-10">
      <label className="form-control gap-2"><span className="font-semibold">Book title</span><input name="title" className="input input-bordered w-full" maxLength={200} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Author</span><input name="author" className="input input-bordered w-full" maxLength={120} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Category</span><select name="category" className="select select-bordered w-full" defaultValue="" required><option value="" disabled>Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label className="form-control gap-2"><span className="font-semibold">Cover image URL</span><input name="image" type="url" className="input input-bordered w-full" maxLength={2048} placeholder="https://…" required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Description</span><textarea name="description" className="textarea textarea-bordered min-h-32 w-full" maxLength={5000} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Total copies</span><input name="totalCopies" type="number" className="input input-bordered w-full" min={1} max={100000} defaultValue={1} required /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn w-full border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busy}>{busy ? "Saving book…" : "Add book to the library"}</button>
    </form>
  );
}
