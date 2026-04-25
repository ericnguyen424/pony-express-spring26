import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authorBooksQuery, authorQuery } from "../../utils/query.ts";

export const Route = createFileRoute("/authors/$authorId")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { sort: string } => (
    { sort: search.sort as string || "title" }
  ),
  loaderDeps: ({ search: { sort } }) => ({ sort }),
  loader: (
    { params: { authorId }, deps: { sort }, context: { queryClient } },
  ) => {
    queryClient.prefetchQuery(authorQuery(authorId));
    queryClient.prefetchQuery(authorBooksQuery(authorId, sort));
  },
  errorComponent: () => <Navigate to="/authors" />,
});

function RouteComponent() {
  const { authorId } = Route.useParams();
  const { data: author } = useSuspenseQuery(authorQuery(authorId));

  return (
    <main className="bg-lime-300 flex-1 ">
      <section className="m-2 py-2 px-4 border-2 bg-violet-200 border-violet-700 h-fit">
        <h2 className="text-xl font-bold text-center">{author.name}</h2>
        <div className="max-h-500">
          <BooksTable />
        </div>
      </section>
    </main>
  );
}

function BooksTable() {
  const { authorId } = Route.useParams();
  const { sort } = Route.useSearch();
  const { data: { books } } = useSuspenseQuery(
    authorBooksQuery(authorId, sort),
  );

  return (
    <table className="w-full mt-2 border-2 border-pink-800 table-auto text-left overflow-auto">
      <thead className="border-2 border-pink-800">
        <tr className="bg-indigo-300">
          <th className="p-2 font-medium">
            <Link
              from={Route.fullPath}
              search={{ sort: "title" }}
              activeProps={{ className: "font-extrabold" }}
            >
              title
            </Link>
          </th>
          <th className="p-2 font-medium">
            <Link
              from={Route.fullPath}
              search={{ sort: "year" }}
              activeProps={{ className: "font-extrabold" }}
            >
              year
            </Link>
          </th>
          <th className="p-2 font-medium text-gray-700">
            isbn
          </th>
        </tr>
      </thead>
      <tbody>
        {[...books, ...books, ...books, ...books, ...books].map((book) => (
          <tr key={book.id} className="odd:bg-pink-100 even:bg-pink-200">
            <th className="p-2">
              <Link
                to="/books/$bookId"
                params={{ bookId: book.id }}
                className="underline text-violet-900"
              >
                {book.title}
              </Link>
            </th>
            <td className="px-2 py-1">{book.year}</td>
            <td className="px-2 py-1">{book.isbn}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
