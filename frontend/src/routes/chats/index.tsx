import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { chatsQuery } from "../../query.ts";
import type { ChatSort } from "../../types.ts";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";

export const Route = createFileRoute("/chats/")({
  validateSearch: (search: Record<string, unknown>): { sort: ChatSort } => ({
    sort: search.sort === "name" ? "name" : "id",
  }),
  component: Chats,
});

function Chats() {
  const { sort } = Route.useSearch();
  const { data: chats = [] } = useQuery(chatsQuery(sort));

  const items: NavItem[] = [
    { kind: "page", name: "Account", link: "/account" },
    {
      kind: "chat",
      name: "Chats",
      link: "/chats",
      active: true,
      chats: chats.map((chat) => ({
        name: chat.name,
        link: `/chats/${chat.id}`,
      })),
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Chats</h1>

          <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
            <div>
              <label
                htmlFor="chat-name"
                className="block text-sm font-medium mb-1"
              >
                Chat name
              </label>
              <input
                id="chat-name"
                name="chat-name"
                type="text"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              Start a new chat
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
