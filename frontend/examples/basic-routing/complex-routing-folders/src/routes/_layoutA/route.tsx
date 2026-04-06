import { createFileRoute, Outlet } from "@tanstack/react-router";
import Main from "../../components/Main.tsx";

export const Route = createFileRoute("/_layoutA")({
  component: Layout,
});

function Layout() {
  return (
    <Main>
      <Outlet />
    </Main>
  );
}
