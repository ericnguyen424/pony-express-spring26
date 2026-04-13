import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import Main from "../../components/Main.tsx";

export const Route = createFileRoute("/_layoutB")({
  component: NavLayout,
});

function NavLayout() {
  return (
    <div className="flex">
      <aside className="w-64 h-screen border-r border-amber-800">
        <nav className="flex flex-col">
          <Link to="/" {...linkProps}>home</Link>
          <Link to="/colors" {...linkProps}>colors</Link>
          <Link to="/hello-world" {...linkProps}>hello world</Link>
          <Link to="/pet-name" {...linkProps}>pet name</Link>
          <Link to="/pets" {...linkProps}>pets</Link>
          <Link to="/register" {...linkProps}>register</Link>
        </nav>
      </aside>
      <Main>
        <Outlet />
      </Main>
    </div>
  );
}

const baseClassNames = [
  "px-4 py-2",
  "underline",
  "min-h-12",
  "items-center",
];
const activeClassNames = [
  "font-bold",
  "text-lime-800",
  "bg-amber-200",
  "border-l-5",
  "border-amber-800",
  "z-2",
  "shadow",
];
const inactiveClassNames = [
  "text-amber-800",
  "hover:text-lime-800",
  "hover:bg-amber-200",
];

const linkProps: {
  className: string;
  activeProps: { className: string };
  inactiveProps: { className: string };
} = {
  className: baseClassNames.join(" "),
  activeProps: { className: activeClassNames.join(" ") },
  inactiveProps: { className: inactiveClassNames.join(" ") },
};
