import { createFileRoute, redirect } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RouterContext } from "../../router.ts";
import { chatsQuery } from "../../query.ts";
import { ApiError, createChat } from "../../api.ts";
import { useAccount, useAuth } from "../../hooks.ts";
import type { Chat, ChatSort } from "../../types.ts";
import type {} from "../../routeTree.gen.ts";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";
import { ErrorMessage } from "../../../components/messages.tsx";

export const Route = createFileRoute("/chats/")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  validateSearch: (search: Record<string, unknown>): { sort: ChatSort } => ({
    sort: search.sort === "name" ? "name" : "id",
  }),
  component: Chats,
});

function Chats() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { sort } = Route.useSearch();
  const { data: account } = useAccount();
  const { data: chats = [] } = useQuery(chatsQuery(sort));
  const [chatName, setChatName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toCreateChatErrorMessage = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return "Unable to create chat.";
    }

    if (
      error.status === 422 &&
      typeof error.details === "object" &&
      error.details !== null &&
      "error" in error.details &&
      (error.details as { error?: unknown }).error === "value_not_allowed"
    ) {
      return "Chat name is not allowed.";
    }

    return "Unable to create chat.";
  };

  const upsertChat = (currentChats: Chat[] | undefined, newChat: Chat): Chat[] => {
    const existing = currentChats ?? [];
    if (existing.some((chat) => chat.id === newChat.id)) {
      return existing;
    }
    return [...existing, newChat];
  };

  const createChatMutation = useMutation({
    mutationFn: (name: string) => {
      if (!account) {
        throw new Error("Missing account");
      }

      return createChat(
        {
          name,
          owner_id: account.id,
        },
        token ?? undefined,
      );
    },
    onSuccess: async (newChat) => {
      setErrorMessage("");
      setChatName("");

      queryClient.setQueryData(["chats", "id"], (previous: Chat[] | undefined) =>
        upsertChat(previous, newChat)
      );
      queryClient.setQueryData(["chats", "name"], (previous: Chat[] | undefined) =>
        [...upsertChat(previous, newChat)].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate({ to: `/chats/${newChat.id}` });
    },
    onError: (error) => {
      setErrorMessage(toCreateChatErrorMessage(error));
    },
  });

  const canSubmit = chatName.trim().length > 0 && !!account;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || createChatMutation.isPending) {
      return;
    }

    createChatMutation.mutate(chatName.trim());
  };

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

          <form
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
            onSubmit={handleSubmit}
          >
            <ErrorMessage message={errorMessage} />

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
                value={chatName}
                onChange={(event) => setChatName(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || createChatMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {createChatMutation.isPending ? "Creating..." : "Start a new chat"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
