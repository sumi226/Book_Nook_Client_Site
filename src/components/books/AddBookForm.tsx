"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createBook, updateBook, uploadBookImage } from "@/lib/api";
import type { Book } from "@/types/book";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

interface AddBookFormProps {
  book?: Book;
  onSaved?: (book: Book) => void;
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
      const directUrl = String(data.get("imageUrl") || "").trim();

      let image = book?.image;
      if (imageFile) {
        if (imageFile.size > 4 * 1024 * 1024) {
          throw new Error("Cover image must be 4 MB or smaller.");
        }
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(imageFile.type)) {
          throw new Error("Cover must be a JPEG, PNG, WebP, or GIF image.");
        }
        toast.loading("Uploading cover image to ImgBB…", { id: "img-upload" });
        try {
          image = (await uploadBookImage(imageFile)).url;
          toast.success("Cover image uploaded successfully to ImgBB!", { id: "img-upload" });
        } catch (uploadErr) {
          toast.dismiss("img-upload");
          throw uploadErr;
        }
      } else if (directUrl) {
        image = directUrl;
      }

      if (!image) {
        throw new Error("Please upload an image file via ImgBB or enter an image URL from ImgBB / PostImage.");
      }

      const rawCopies = data.get("totalCopies");
      const totalCopies = Number(rawCopies);
      if (!Number.isInteger(totalCopies) || totalCopies < 1) {
        throw new Error("Total Copies must be a valid number of at least 1.");
      }

      const input = {
        title: String(data.get("title") || "").trim(),
        author: String(data.get("author") || "").trim(),
        category: String(data.get("category") || ""),
        image,
        description: String(data.get("description") || "").trim(),
        totalCopies,
      };

      const savedBook = book
        ? await updateBook(book._id, input)
        : await createBook(input);

      toast.success(book ? "Book details updated in MongoDB successfully!" : "Book added to the library in MongoDB successfully!");
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
      <label className="form-control gap-2">
        <span className="font-semibold">Book title</span>
        <input name="title" className="input input-bordered w-full" maxLength={200} defaultValue={book?.title} required />
      </label>

      <label className="form-control gap-2">
        <span className="font-semibold">Author</span>
        <input name="author" className="input input-bordered w-full" maxLength={120} defaultValue={book?.author} required />
      </label>

      <label className="form-control gap-2">
        <span className="font-semibold">Category</span>
        <select name="category" className="select select-bordered w-full" defaultValue={book?.category || ""} required>
          <option value="" disabled>Choose a category</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <label className="form-control gap-2">
          <span className="font-semibold">Upload Cover Image (ImgBB)</span>
          <input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="file-input file-input-bordered w-full bg-white" />
          <span className="text-xs text-slate-500">
            JPEG, PNG, WebP, or GIF. Maximum size: 4 MB.
          </span>
        </label>

        <div className="divider my-1 text-xs uppercase text-slate-400 font-semibold">Or provide image link</div>

        <label className="form-control gap-2">
          <span className="font-semibold">Cover Image URL (optional)</span>
          <input
            name="imageUrl"
            type="url"
            placeholder="https://..."
            className="input input-bordered w-full bg-white"
            defaultValue={book?.image}
          />
          <span className="text-xs text-slate-500">
            Use a direct image link if the cover is already hosted online.
          </span>
        </label>
        {book && <p className="break-all text-xs text-slate-500">Current cover: {book.image}</p>}
      </div>

      <label className="form-control gap-2">
        <span className="font-semibold">Description</span>
        <textarea name="description" className="textarea textarea-bordered min-h-32 w-full" maxLength={5000} defaultValue={book?.description} required />
      </label>

      <label className="form-control gap-2">
        <span className="font-semibold">Total Copies</span>
        <input name="totalCopies" type="number" className="input input-bordered w-full" min={1} max={100000} defaultValue={book?.totalCopies || 1} placeholder="e.g. 5" required />
      </label>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn w-full border-0 bg-[#C87958] text-[#00022E] hover:bg-[#da9578]" disabled={busy}>
        {busy ? "Uploading and saving…" : book ? "Save changes" : "Add book to the library"}
      </button>
    </form>
  );
}
