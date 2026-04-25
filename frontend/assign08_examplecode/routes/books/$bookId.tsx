import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { bookQuery } from "../../utils/query.ts";
import { Book } from "../../utils/types.ts";
import { PropsWithChildren } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$bookId")({
  component: RouteComponent,
  loader: ({ params: { bookId }, context: { queryClient } }) => {
    queryClient.prefetchQuery(bookQuery(bookId));
  },
  errorComponent: () => <Navigate to="/books" />,
});

function RouteComponent() {
  const { bookId } = Route.useParams();
  const { data: book, isPending, isError } = useQuery(bookQuery(bookId));

  if (isPending) {
    return <p>loading...</p>;
  }

  if (isError) {
    return <Navigate to="/books" />;
  }

  return <BookComponent book={book} />;
}

function BookComponent({ book }: { book: Book }) {
  return (
    <section className="bg-lime-300 flex-1 ">
      <section className="m-2 py-2 px-4 border-2 bg-violet-200 border-violet-700 h-fit">
        <h2 className="text-xl font-bold text-center">{book.title}</h2>
        <ul className="space-y-2 py-2">
          <Attr label="author">
            <Link
              to="/authors/$authorId"
              params={{ authorId: book.author.id }}
              className="underline text-violet-900"
            >
              {book.author.name}
            </Link>
          </Attr>
          <Attr label="year">{book.year}</Attr>
          <Attr label="isbn">{book.isbn}</Attr>
        </ul>
      </section>
    </section>
  );
}

function Attr({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <li className="grid grid-cols-2 gap-8">
      <span className="text-gray-700 text-right">
        {label}
      </span>
      <span>
        {children}
      </span>
    </li>
  );
}
