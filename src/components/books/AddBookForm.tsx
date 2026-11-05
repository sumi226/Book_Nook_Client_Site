"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createBook, updateBook } from "@/lib/api";
import type { Book } from "@/types/book";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

interface AddBookFormProps {
  book?: Book;
  onSaved?: (book: Book) => void;
}

interface ImgBBResponse {
  success: boolean;
  data?: { display_url: string; url: string };
  error?: { message?: string };
}

async function uploadCover(file: File) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Image uploads are not configured. Set NEXT_PUBLIC_IMGBB_API_KEY.");
  }
  const formData = new FormData();
  formData.set("key", apiKey);
  formData.set("image", file);

  const response = await fetch(IMGBB_UPLOAD_URL, { method: "POST", body: formData });
  const result = await response.json().catch(() => null) as ImgBBResponse | null;
  const imageUrl = result?.data?.display_url || result?.data?.url;
  if (!response.ok || !result?.success || !imageUrl) {
    throw new Error(result?.error?.message || "The cover image could not be uploaded.");
  }
  return imageUrl;
}

export default function AddBookForm({ book, onSaved }: AddBookFormProps) {
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
      const fileEntry = data.get("imageFile");
      const imageFile = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
      const image = imageFile ? await uploadCover(imageFile) : book?.image;
      if (!image) {
        throw new Error("Choose a cover image to upload.");
      }

      const input = {
        title: String(data.get("title") || "").trim(),
        author: String(data.get("author") || "").trim(),
        category: String(data.get("category") || ""),
        image,
        description: String(data.get("description") || "").trim(),
        totalCopies: Number(data.get("totalCopies")),
      };
      const savedBook = book
        ? await updateBook(book._id, input)
        : await createBook(input);

      toast.success(book ? "Book details updated." : "Book added to the library.");
      if (onSaved) {
        onSaved(savedBook);
      } else {
        router.push(`/books/${encodeURIComponent(savedBook._id)}`);
        router.refresh();
      }
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "The book could not be saved.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl bg-white p-7 text-slate-900 shadow-2xl sm:p-10">
      <label className="form-control gap-2"><span className="font-semibold">Book title</span><input name="title" className="input input-bordered w-full" maxLength={200} defaultValue={book?.title} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Author</span><input name="author" className="input input-bordered w-full" maxLength={120} defaultValue={book?.author} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Category</span><select name="category" className="select select-bordered w-full" defaultValue={book?.category || ""} required><option value="" disabled>Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label className="form-control gap-2"><span className="font-semibold">Cover image</span><input name="imageFile" type="file" accept="image/*" className="file-input file-input-bordered w-full" required={!book} /><span className="text-sm text-slate-500">{book ? "Choose a new image to replace the current cover; leave empty to keep it." : "Your image will be uploaded securely to ImgBB."}</span>{book && <span className="break-all text-xs text-slate-500">Current cover: {book.image}</span>}</label>
      <label className="form-control gap-2"><span className="font-semibold">Description</span><textarea name="description" className="textarea textarea-bordered min-h-32 w-full" maxLength={5000} defaultValue={book?.description} required /></label>
      <label className="form-control gap-2"><span className="font-semibold">Total copies</span><input name="totalCopies" type="number" className="input input-bordered w-full" min={1} max={100000} defaultValue={book?.totalCopies || 1} required /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn w-full border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busy}>{busy ? "Uploading and saving…" : book ? "Save changes" : "Add book to the library"}</button>
    </form>
  );
}
