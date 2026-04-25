import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthorNav } from "../../components/navigation.tsx";
import { useQuery } from "@tanstack/react-query";
import { authorsQuery } from "../../utils/query.ts";

export const Route = createFileRoute("/authors")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(authorsQuery);
  },
});

function RouteComponent() {
  const { data, error, isPending, isError } = useQuery(authorsQuery);

  if (isError) {
    return <ErrorComponent error={error} preload={false} />;
  }

  if (isPending) {
    return <PendingComponent />;
  }

  const authors = data.authors;

  return (
    <>
      <aside className="w-64 max-w-64 border-r-3 border-pink-600 bg-lime-200">
        <AuthorNav authors={authors} />
      </aside>
      <Outlet />
    </>
  );
}

function ErrorComponent(
  { error, preload }: { error: Error; preload: boolean },
) {
  return (
    <p className="p-4 flex space-x-16">
      <span>
        error: {error?.message || "unknown error"}
      </span>
      {preload && <span className="italic font-bold">(preload)</span>}
    </p>
  );
}

function PendingComponent() {
  return <p className="p-4">loading ...</p>;
}
