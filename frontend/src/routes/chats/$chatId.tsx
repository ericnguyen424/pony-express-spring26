import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../api.ts";
import { chatsQuery, chatMessagesWithAccountsQuery } from "../../query.ts";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";

export const Route = createFileRoute("/chats/$chatId")({
  component: ChatDetails,
});

function ChatDetails() {
  const { chatId } = Route.useParams();
  const parsedChatId = Number(chatId);
  const hasValidChatId = Number.isInteger(parsedChatId) && parsedChatId > 0;

  const { data: chats = [] } = useQuery(chatsQuery("name"));

  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    ...chatMessagesWithAccountsQuery(parsedChatId),
    enabled: hasValidChatId,
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

  const isNotFound =
    hasValidChatId && isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8 min-w-0">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Chat: {chatId}</h1>

          <section className="border rounded-lg bg-white shadow-sm h-[calc(100vh-10rem)] overflow-y-auto">
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
                      <li key={message.id} className="p-4 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium">
                            {message.account?.username ?? "[removed]"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <p>{message.text}</p>
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
        </div>
      </main>
    </div>
  );
}
