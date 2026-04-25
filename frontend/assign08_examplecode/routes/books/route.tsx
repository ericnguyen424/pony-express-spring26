import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { BookNav } from "../../components/navigation.tsx";
import { booksQuery } from "../../utils/query.ts";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/books")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(booksQuery);
  },
});

function RouteComponent() {
  const { data, isPending, isError } = useQuery(booksQuery);

  if (isPending) {
    return <h2>loading . . .</h2>;
  }

  if (isError) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <aside className="w-64 max-w-64 border-r-3 border-pink-600 bg-lime-200">
        <BookNav books={data.books} />
      </aside>
      <Outlet />
    </>
  );
}
