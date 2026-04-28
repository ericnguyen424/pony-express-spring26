import { createFileRoute, redirect } from "@tanstack/react-router";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { RouterContext } from "../../../router.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  createChatMessage,
  deleteChatMessage,
  updateChatMessage,
} from "../../../api.ts";
import { useAccount, useAuth } from "../../../hooks.ts";
import {
  chatMembersQuery,
  chatsQuery,
  chatMessagesWithAccountsQuery,
} from "../../../query.ts";
import type {} from "../../../routeTree.gen.ts";
import NavBar, { type NavItem } from "../../../../components/navbar.tsx";
import { ErrorMessage } from "../../../../components/messages.tsx";

export const Route = createFileRoute("/chats/$chatId/__index")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: ChatDetails,
});

function ChatDetails() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data: account } = useAccount();
  const { chatId } = Route.useParams();
  const messageListRef = useRef<HTMLElement | null>(null);
  const parsedChatId = Number(chatId);
  const hasValidChatId = Number.isInteger(parsedChatId) && parsedChatId > 0;

  const { data: chats = [] } = useQuery(chatsQuery("name"));
  const { data: members = [] } = useQuery({
    ...chatMembersQuery(parsedChatId, "id"),
    enabled: hasValidChatId,
  });

  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    ...chatMessagesWithAccountsQuery(parsedChatId),
    enabled: hasValidChatId,
  });

  const [newMessageText, setNewMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedChat = chats.find((chat) => chat.id === parsedChatId);

  const isMember =
    !!account && members.some((member) => member.id === account.id);

  const invalidateChatMessageQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["chats", parsedChatId, "messages"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["chats", parsedChatId, "messages-with-accounts"],
    });
  };

  const createMessageMutation = useMutation({
    mutationFn: (text: string) => {
      if (!account) {
        throw new Error("Missing account");
      }

      return createChatMessage(
        parsedChatId,
        {
          text,
          account_id: account.id,
          chat_id: parsedChatId,
          created_at: new Date().toISOString(),
        },
        token ?? undefined,
      );
    },
    onSuccess: async () => {
      setErrorMessage("");
      setNewMessageText("");
      await invalidateChatMessageQueries();
    },
    onError: () => {
      setErrorMessage("Unable to send message.");
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ messageId, text }: { messageId: number; text: string }) => {
      if (!account) {
        throw new Error("Missing account");
      }

      return updateChatMessage(
        parsedChatId,
        messageId,
        {
          text,
          account_id: account.id,
          chat_id: parsedChatId,
          owner_id: account.id,
        },
        token ?? undefined,
      );
    },
    onSuccess: async () => {
      setErrorMessage("");
      setEditingMessageId(null);
      setEditingMessageText("");
      await invalidateChatMessageQueries();
    },
    onError: () => {
      setErrorMessage("Unable to update message.");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) =>
      deleteChatMessage(parsedChatId, messageId, token ?? undefined),
    onSuccess: async () => {
      setErrorMessage("");
      await invalidateChatMessageQueries();
    },
    onError: () => {
      setErrorMessage("Unable to delete message.");
    },
  });

  const chatLinks = chats.map((chat) => ({
    name: chat.name,
    link: `/chats/${chat.id}`,
  }));

  if (!chatLinks.some((chat) => chat.link === `/chats/${chatId}`)) {
    chatLinks.push({ name: chatId, link: `/chats/${chatId}` });
  }

  const items: NavItem[] = [
    { kind: "page", name: "Account", link: "/account" },
    {
      kind: "chat",
      name: "Chats",
      link: "/chats",
      active: true,
      chats: chatLinks.map((chat) => ({
        ...chat,
        active: chat.link === `/chats/${chatId}`,
      })),
    },
  ];

  const sortedMessages = [...messages].sort(
    (a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime(),
  );

  const canSendMessage =
    isMember && newMessageText.trim().length > 0 && !createMessageMutation.isPending;

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSendMessage) {
      return;
    }

    createMessageMutation.mutate(newMessageText.trim());
  };

  const canEditOrDeleteMessage = (messageAccountId: number) => {
    if (!account) {
      return false;
    }

    return account.id === messageAccountId;
  };

  useEffect(() => {
    if (!hasValidChatId || isLoading || isError || !messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      left: 0,
      behavior: "auto",
    });
  }, [hasValidChatId, isLoading, isError, sortedMessages.length]);

  const isNotFound =
    hasValidChatId && isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8 min-w-0">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold">
              Chat: {selectedChat?.name ?? chatId}
            </h1>
            {isMember
              ? (
                <button
                  onClick={() => navigate({ to: `/chats/${chatId}/settings` })}
                  className="text-blue-700 underline cursor-pointer bg-none border-none p-0 font-inherit"
                >
                  Settings
                </button>
              )
              : null}
          </div>

          <ErrorMessage message={errorMessage} />

          <section
            ref={messageListRef}
            className="border rounded-lg bg-white shadow-sm h-[calc(100vh-14rem)] overflow-y-auto"
          >
            {hasValidChatId
              ? isLoading
                ? <p className="p-4 text-gray-600">Loading messages...</p>
                : isNotFound
                ? (
                  <div className="p-6 space-y-2">
                    <h2 className="text-xl font-semibold">Chat not found</h2>
                    <p className="text-gray-700">
                      Chat {chatId} does not exist.
                    </p>
                  </div>
                )
                : isError
                ? (
                  <p className="p-4 text-red-700">
                    Could not load chat messages.
                  </p>
                )
                : (
                  <ul className="divide-y">
                    {sortedMessages.map((message) => (
                      <li key={message.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium">
                            {message.account?.username ?? "[removed]"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>

                        {editingMessageId === message.id
                          ? (
                            <form
                              className="flex gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const trimmed = editingMessageText.trim();
                                if (
                                  trimmed.length === 0 ||
                                  trimmed === message.text ||
                                  updateMessageMutation.isPending
                                ) {
                                  return;
                                }

                                updateMessageMutation.mutate({
                                  messageId: message.id,
                                  text: trimmed,
                                });
                              }}
                            >
                              <input
                                type="text"
                                className="flex-1 border rounded-md px-3 py-2"
                                value={editingMessageText}
                                onChange={(event) =>
                                  setEditingMessageText(event.target.value)}
                              />
                              <button
                                type="submit"
                                disabled={
                                  editingMessageText.trim().length === 0 ||
                                  editingMessageText.trim() === message.text ||
                                  updateMessageMutation.isPending
                                }
                                className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 font-medium hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md border px-3 py-2 font-medium hover:bg-gray-100"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingMessageText("");
                                }}
                              >
                                Cancel
                              </button>
                            </form>
                          )
                          : (
                            <div className="flex items-start justify-between gap-3">
                              <p className="flex-1">{message.text}</p>

                              {canEditOrDeleteMessage(message.accountId)
                                ? (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded-md border px-3 py-1 font-medium hover:bg-gray-100"
                                      onClick={() => {
                                        setEditingMessageId(message.id);
                                        setEditingMessageText(message.text);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      disabled={deleteMessageMutation.isPending}
                                      className="inline-flex items-center rounded-md border border-red-300 text-red-700 px-3 py-1 font-medium hover:bg-red-50"
                                      onClick={() => {
                                        deleteMessageMutation.mutate(message.id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )
                                : null}
                            </div>
                          )}
                      </li>
                    ))}
                  </ul>
                )
              : (
                <div className="p-6 space-y-2">
                  <h2 className="text-xl font-semibold">Chat not found</h2>
                  <p className="text-gray-700">
                    Chat {chatId} does not exist.
                  </p>
                </div>
              )}
          </section>

          <section className="mt-4">
            {isMember
              ? (
                <form className="flex gap-2" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="flex-1 border rounded-md px-3 py-2"
                    value={newMessageText}
                    onChange={(event) => setNewMessageText(event.target.value)}
                    placeholder="New message"
                  />
                  <button
                    type="submit"
                    disabled={!canSendMessage}
                    className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
                  >
                    {createMessageMutation.isPending ? "Sending..." : "Send"}
                  </button>
                </form>
              )
              : (
                <p className="text-sm text-gray-600">
                  You must be a member of this chat to send messages.
                </p>
              )}
          </section>
        </div>
      </main>
    </div>
  );
}
