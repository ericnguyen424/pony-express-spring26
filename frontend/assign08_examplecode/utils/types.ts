export interface ApiErrorData {
  error: string;
  message: string;
}

export interface ApiBook {
  id: number;
  title: string;
  isbn: string;
  year: number;
  author_id: number;
}

interface ApiCollectionMetadata {
  count: number;
  sort: string;
}

export interface ApiBookCollection {
  metadata: ApiCollectionMetadata;
  books: ApiBook[];
}

export interface ApiAuthor {
  id: number;
  name: string;
}

export interface ApiAuthorCollection {
  metadata: ApiCollectionMetadata;
  authors: ApiAuthor[];
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  year: number;
  author: ApiAuthor;
}
