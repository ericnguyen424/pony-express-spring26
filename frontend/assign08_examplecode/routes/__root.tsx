import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { OuterNav } from "../components/navigation.tsx";

function RootLayout() {
  return (
    <>
      <h1 className="text-4xl font-bold py-2 text-center border-b-3 border-pink-600">
        <Link to="/">
          my little library
        </Link>
      </h1>
      <div className="flex h-[calc(100vh-59px)] bg-violet-100">
        <aside className="w-32 max-w-48 bg-lime-100 border-r-3 border-pink-600">
          <OuterNav />
        </aside>
        <Outlet />
      </div>
    </>
  );
}

function NotFound() {
  return (
    <section className="max-w-3xl mx-auto text-center pt-16">
      <h1 className="text-4xl font-bold">
        not found :(
      </h1>
      <p>the page you are searching for does not exist</p>
    </section>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
