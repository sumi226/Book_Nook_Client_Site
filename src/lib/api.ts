import type { Book, Borrow, PageResult } from "@/types/book";

const defaultApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://booknookserversite.vercel.app"
    : "http://localhost:8000";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const configuredApiIsLocal =
  configuredApiUrl !== undefined &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(configuredApiUrl);
const API_URL = (
  process.env.NODE_ENV === "production" && configuredApiIsLocal
    ? defaultApiUrl
    : configuredApiUrl || defaultApiUrl
).replace(/\/$/, "");

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
  if (init.body && !headers.has("content-type")) {
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

export async function getBook(id: string) {
  const result = await apiRequest<{ book: Book }>(
    `/books/${encodeURIComponent(id)}`,
  );
  return result.book;
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
