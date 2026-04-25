import { createFileRoute, redirect } from "@tanstack/react-router";
import type { RouterContext } from "../router.ts";
import NavBar, { type NavItem } from "../../components/navbar.tsx";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: Index,
});

function Index() {
  const items: NavItem[] = [
    { kind: "page", name: "Account", link: "/account" },
    { kind: "chat", name: "Chats", link: "/chats", chats: [] },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Pony Express</h1>
          <p>This is a messaging application that allows you to create chats</p>
        </div>
      </main>
    </div>
  );
}
