"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteBook, listMyBooks } from "@/lib/api";
import AddBookForm from "@/components/books/AddBookForm";
import BookCard from "@/components/books/BookCard";
import type { Book } from "@/types/book";

export default function MyBooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let active = true;
    listMyBooks()
      .then((result) => {
        if (active) setBooks(result.items);
      })
      .catch((issue: unknown) => {
        const message = issue instanceof Error ? issue.message : "Could not load your books.";
        if (active) {
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retryLoad() {
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  function openEdit(book: Book) {
    setSelectedBook(book);
    editDialogRef.current?.showModal();
  }

  function openDelete(book: Book) {
    setDeleteTarget(book);
    deleteDialogRef.current?.showModal();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget._id);
      setBooks((current) => current.filter((entry) => entry._id !== deleteTarget._id));
      toast.success("Book removed from your collection.");
      deleteDialogRef.current?.close();
    } catch (issue) {
      toast.error(issue instanceof Error ? issue.message : "Could not remove this book.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p role="status" className="flex items-center gap-3 text-white"><LoaderCircle className="animate-spin" />Loading your books…</p>;
  }

  if (error) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-white p-7 text-red-800">
      <p>Could not load your books: {error}</p>
      <button type="button" className="btn btn-sm mt-4" onClick={retryLoad}>Try again</button>
    </div>;
  }

  return <>
    {books.length ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div key={book._id} className="space-y-3">
            <BookCard book={book} />
            <div className="flex gap-3">
              <button type="button" className="btn btn-sm flex-1 border-[#00022E]/30 bg-white text-[#00022E]" onClick={() => openEdit(book)}>
                <Pencil size={15} /> Edit
              </button>
              <button type="button" className="btn btn-sm flex-1 border-red-200 bg-white text-red-700 hover:bg-red-50" onClick={() => openDelete(book)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-[#00022E]/20 bg-white p-8 text-[#514740]">
        <p>You haven’t added a book yet.</p>
        <Link className="btn mt-5 border-0 bg-[#C87958] text-[#00022E]" href="/add-book">Add your first book</Link>
      </div>
    )}

    <dialog
      ref={editDialogRef}
      className="modal"
      aria-labelledby="edit-book-title"
      onClose={() => setSelectedBook(null)}
    >
      <div className="modal-box max-h-[90vh] max-w-2xl overflow-y-auto bg-[#faf6f0]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="edit-book-title" className="font-serif text-2xl font-bold text-[#00022E]">Edit book</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => editDialogRef.current?.close()}>Close</button>
        </div>
        {selectedBook && <AddBookForm
          key={selectedBook._id}
          book={selectedBook}
          onSaved={(updatedBook) => {
            setBooks((current) => current.map((entry) => entry._id === updatedBook._id ? updatedBook : entry));
            editDialogRef.current?.close();
          }}
        />}
      </div>
      <form method="dialog" className="modal-backdrop"><button aria-label="Close edit dialog">close</button></form>
    </dialog>

    <dialog
      ref={deleteDialogRef}
      className="modal"
      aria-labelledby="delete-book-title"
      onClose={() => setDeleteTarget(null)}
    >
      <div className="modal-box max-w-md bg-white text-slate-900">
        <h2 id="delete-book-title" className="font-serif text-2xl font-bold">Delete this book?</h2>
        <p className="mt-4 text-slate-600">
          {deleteTarget
            ? `“${deleteTarget.title}” will be removed from your collection. This action cannot be undone.`
            : "This action cannot be undone."}
        </p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" disabled={deleting} onClick={() => deleteDialogRef.current?.close()}>Cancel</button>
          <button type="button" className="btn border-0 bg-red-700 text-white hover:bg-red-800" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? "Deleting…" : "Delete book"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button aria-label="Close delete dialog">close</button></form>
    </dialog>
  </>;
}
