import type { Book, Borrow, PageResult } from "@/types/book";

function selectEnvironmentUrl(value: string | undefined, fallback: string) {
  const candidates = (value || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const isLocalUrl = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
  const preferred = process.env.NODE_ENV === "production"
    ? candidates.find((url) => !isLocalUrl(url))
    : candidates.find(isLocalUrl);

  return preferred || fallback;
}

const API_URL = selectEnvironmentUrl(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "production"
    ? "https://booknookserversite.vercel.app"
    : "http://localhost:8000",
);

type ApiOptions = RequestInit & { authenticated?: boolean };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAccessToken() {
  const response = await fetch("/api/auth/token", {
    credentials: "include",
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as
    | { token?: string; message?: string }
    | string;

  const token = typeof payload === "string" ? payload : payload?.token;

  if (!response.ok || !token) {
    const message = typeof payload === "object" ? payload?.message : undefined;
    throw new Error(message || "Please sign in again to continue.");
  }
  return token;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { authenticated = false, headers: inputHeaders, ...init } = options;
  const headers = new Headers(inputHeaders);
  if (
    init.body &&
    !(typeof FormData !== "undefined" && init.body instanceof FormData) &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }
  if (authenticated) {
    headers.set("authorization", "Bearer " + (await getAccessToken()));
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : `The request failed (${response.status}).`;
    const details =
      payload && Array.isArray(payload.details) ? ` ${payload.details.join(" ")}` : "";
    throw new ApiError(`${message}${details}`, response.status);
  }
  return payload as T;
}

export async function listBooks(page = 1, limit = 24) {
  const result = await apiRequest<{
    books: Book[];
    pagination: PageResult<Book>["pagination"];
  }>(`/books?page=${page}&limit=${limit}`);
  return { items: result.books, pagination: result.pagination };
}

function unwrapBook(payload: unknown): Book | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate =
    "book" in payload ? (payload as { book?: unknown }).book : payload;
  if (
    candidate &&
    typeof candidate === "object" &&
    typeof (candidate as { _id?: unknown })._id === "string"
  ) {
    return candidate as Book;
  }
  return null;
}

export async function getBook(id: string) {
  let directError: unknown;

  try {
    const payload = await apiRequest<{ book?: Book } | Book>(
      `/books/${encodeURIComponent(id)}`,
    );
    const book = unwrapBook(payload);
    if (book) return book;
    directError = new ApiError("Book not found.", 404);
  } catch (issue) {
    directError = issue;
  }

  // Some API deployments do not expose the single-book endpoint (or it may be
  // temporarily failing). Fall back to the public catalog so a book that is
  // visible in the catalog still has a working details page.
  try {
    const pageSize = 100;
    let page = 1;
    let totalPages = 1;
    do {
      const result = await listBooks(page, pageSize);
      const match = result.items.find((book) => book._id === id);
      if (match) return match;
      totalPages = result.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);
  } catch (fallbackError) {
    if (directError instanceof ApiError) throw directError;
    throw fallbackError;
  }

  throw new ApiError("Book not found.", 404);
}

export async function uploadBookImage(file: File) {
  const formData = new FormData();
  formData.set("image", file);
  return apiRequest<{ url: string }>("/images", {
    method: "POST",
    authenticated: true,
    body: formData,
  });
}

export async function createBook(input: {
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
}) {
  return (
    await apiRequest<{ book: Book }>("/books", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(input),
    })
  ).book;
}

export async function updateBook(
  bookId: string,
  input: {
    title: string;
    author: string;
    category: string;
    image: string;
    description: string;
    totalCopies: number;
  },
) {
  return (
    await apiRequest<{ book: Book }>(`/books/${encodeURIComponent(bookId)}`, {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify(input),
    })
  ).book;
}

export async function listMyBooks(page = 1, limit = 100) {
  const result = await apiRequest<{
    books: Book[];
    pagination: PageResult<Book>["pagination"];
  }>(`/books/mine?page=${page}&limit=${limit}`, { authenticated: true });
  return { items: result.books, pagination: result.pagination };
}

export async function listBorrows(page = 1, limit = 100) {
  const result = await apiRequest<{
    borrows: Borrow[];
    pagination: PageResult<Borrow>["pagination"];
  }>(`/borrows?page=${page}&limit=${limit}`, { authenticated: true });
  return { items: result.borrows, pagination: result.pagination };
}

export async function borrowBook(bookId: string, durationDays: number) {
  return apiRequest<{ borrow: Borrow }>("/borrows", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({ bookId, durationDays }),
  });
}

export async function returnBook(borrowId: string) {
  await apiRequest<void>(`/borrows/${encodeURIComponent(borrowId)}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export async function deleteBook(bookId: string) {
  await apiRequest<void>(`/books/${encodeURIComponent(bookId)}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function getApiUrl() {
  return API_URL;
}
