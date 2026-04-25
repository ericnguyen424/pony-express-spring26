import {
  ApiAuthor,
  ApiAuthorCollection,
  ApiBook,
  ApiBookCollection,
  ApiErrorData,
} from "./types.ts";

const baseUrl = "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  error: string;

  constructor(status: number, data: ApiErrorData) {
    super(data.message);
    this.status = status;
    this.error = data.error;
  }

  log(): void {
    const data = {
      status: this.status,
      error: this.error,
      message: this.message,
    };
    console.log(JSON.stringify(data, null, 2));
  }
}

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return await response.json();
  }
  const errorData = await response.json();
  if ("error" in errorData && "message" in errorData) {
    throw new ApiError(response.status, errorData);
  } else {
    throw new ApiError(response.status, {
      error: "api_error",
      message: JSON.stringify(errorData),
    });
  }
};

const fetchBooks = async (): Promise<ApiBookCollection> => {
  const response = await fetch(baseUrl + "/books?sort=title");
  return handleApiResponse(response);
};

const fetchBookById = async (bookId: string): Promise<ApiBook> => {
  const response = await fetch(baseUrl + "/books/" + bookId);
  return handleApiResponse(response);
};

const fetchBooksByAuthorId = async (
  authorId: string,
  sort: string = "title",
): Promise<ApiBookCollection> => {
  const query = new URLSearchParams({ sort });
  const response = await fetch(
    baseUrl + "/authors/" + authorId + "/books?" + query,
  );
  return handleApiResponse(response);
};

const fetchAuthors = async (): Promise<ApiAuthorCollection> => {
  const response = await fetch(baseUrl + "/authors?sort=name");
  return handleApiResponse(response);
};

const fetchAuthorById = async (authorId: string): Promise<ApiAuthor> => {
  const response = await fetch(baseUrl + "/authors/" + authorId);
  return handleApiResponse(response);
};

const fetchAuthorByBookId = async (bookId: string): Promise<ApiAuthor> => {
  const response = await fetch(baseUrl + "/books/" + bookId + "/author");
  return handleApiResponse(response);
};

const api = {
  fetchAuthorByBookId,
  fetchAuthorById,
  fetchAuthors,
  fetchBookById,
  fetchBooks,
  fetchBooksByAuthorId,
};

export default api;
