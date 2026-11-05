export interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  copies?: number;
  addedByName?: string;
  addedByEmail?: string;
  addedBy?: { name?: string; email?: string };
  addedAt?: string;
  addedDate?: string | Date;
  ownerId?: string;
}

export interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  borrowedAt: string;
  dueAt?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export interface PageResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
