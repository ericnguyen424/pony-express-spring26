import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <nav className="flex space-x-4 border-b-4 p-4">
        <Link to="/">home</Link>
        <Link to="/about">about</Link>
        <Link to="/faq">FAQ</Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
