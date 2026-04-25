import { queryOptions } from "@tanstack/react-query";
import api from "./api.ts";
import { Book } from "./types.ts";

export const authorsQuery = queryOptions({
  queryKey: ["authors"],
  queryFn: () => api.fetchAuthors(),
  placeholderData: {
    metadata: { count: 2, sort: "name" },
    authors: [-1, -2].map((id) => ({
      id,
      name: "loading...",
    })),
  },
});

export const authorQuery = (authorId: string) => (
  queryOptions({
    queryKey: ["authors", authorId],
    queryFn: () => api.fetchAuthorById(authorId),
  })
);

export const authorBooksQuery = (authorId: string, sort: string = "title") => (
  queryOptions({
    queryKey: ["authors", authorId, "books", sort],
    queryFn: () => api.fetchBooksByAuthorId(authorId, sort),
  })
);

export const booksQuery = queryOptions({
  queryKey: ["books"],
  queryFn: () => api.fetchBooks(),
});

export const bookQuery = (bookId: string) => (
  queryOptions({
    queryKey: ["books", bookId],
    queryFn: async (): Promise<Book> => {
      const apiBook = await api.fetchBookById(bookId);
      const apiAuthor = await api.fetchAuthorByBookId(bookId);
      return {
        ...apiBook,
        author: apiAuthor,
      };
    },
  })
);
