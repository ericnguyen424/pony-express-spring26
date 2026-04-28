import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RouterContext } from "../../../router.ts";
import {
  ApiError,
  deleteChatMembership,
  updateChat,
  addChatMembership,
  fetchAllAccounts,
} from "../../../api.ts";
import { useAccount, useAuth } from "../../../hooks.ts";
import { chatMembersQuery, chatsQuery } from "../../../query.ts";
import type { Chat } from "../../../types.ts";
import type {} from "../../../routeTree.gen.ts";
import NavBar, { type NavItem } from "../../../../components/navbar.tsx";
import { ErrorMessage, SuccessMessage } from "../../../../components/messages.tsx";

export const Route = createFileRoute("/chats/$chatId/settings")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: ChatSettings,
});

function ChatSettings() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data: account } = useAccount();
  const { chatId } = Route.useParams();

  const parsedChatId = Number(chatId);
  const hasValidChatId = Number.isInteger(parsedChatId) && parsedChatId > 0;

  const { data: chats = [] } = useQuery(chatsQuery("name"));
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useQuery({
    ...chatMembersQuery(parsedChatId, "username"),
    enabled: hasValidChatId,
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetchAllAccounts("username"),
    staleTime: 60 * 1000, // 1 minute
  });

  const selectedChat = chats.find((chat) => chat.id === parsedChatId);
  const isMember = !!account && members.some((member) => member.id === account.id);
  const isOwner = !!account && !!selectedChat && selectedChat.ownerId === account.id;

  const [chatName, setChatName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [addMemberUsername, setAddMemberUsername] = useState("");

  useEffect(() => {
    if (selectedChat) {
      setChatName(selectedChat.name);
    }
  }, [selectedChat]);

  const upsertChat = (currentChats: Chat[] | undefined, updatedChat: Chat): Chat[] => {
    const existing = currentChats ?? [];
    const replaced = existing.map((chat) =>
      chat.id === updatedChat.id ? updatedChat : chat
    );

    if (replaced.some((chat) => chat.id === updatedChat.id)) {
      return replaced;
    }

    return [...replaced, updatedChat];
  };

  const toUpdateChatError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return "Unable to update chat name.";
    }

    if (
      error.status === 422 &&
      typeof error.details === "object" &&
      error.details !== null &&
      "error" in error.details &&
      (error.details as { error?: unknown }).error === "value_not_allowed"
    ) {
      return "Chat name is unavailable.";
    }

    return "Unable to update chat name.";
  };

  const updateChatMutation = useMutation({
    mutationFn: (name: string) => {
      if (!selectedChat) {
        throw new Error("Missing chat");
      }

      return updateChat(
        parsedChatId,
        {
          name,
          owner_id: selectedChat.ownerId,
        },
        token ?? undefined,
      );
    },
    onSuccess: async (updatedChat) => {
      setErrorMessage("");
      setSuccessMessage("Chat name updated.");
      setActionMessage("");

      queryClient.setQueryData(["chats", "id"], (previous: Chat[] | undefined) =>
        upsertChat(previous, updatedChat)
      );
      queryClient.setQueryData(["chats", "name"], (previous: Chat[] | undefined) =>
        [...upsertChat(previous, updatedChat)].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      setSuccessMessage("");
      setErrorMessage(toUpdateChatError(error));
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) =>
      deleteChatMembership(parsedChatId, memberId, token ?? undefined),
    onSuccess: async (_, memberId) => {
      setErrorMessage("");
      setSuccessMessage("");
      setActionMessage("Member removed.");

      await queryClient.invalidateQueries({
        queryKey: ["chats", parsedChatId, "members", "username"],
      });

      if (account?.id === memberId) {
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
        await queryClient.invalidateQueries({
          queryKey: ["chats", parsedChatId, "messages"],
        });
      }
    },
    onError: () => {
      setActionMessage("");
      setErrorMessage("Unable to remove member.");
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (memberId: number) =>
      addChatMembership(parsedChatId, memberId, token ?? undefined),
    onSuccess: async () => {
      setErrorMessage("");
      setActionMessage("");
      setSuccessMessage("Member added.");
      setAddMemberUsername("");

      await queryClient.invalidateQueries({
        queryKey: ["chats", parsedChatId, "members", "username"],
      });
    },
    onError: (error) => {
      setSuccessMessage("");
      if (error instanceof ApiError && error.status === 400) {
        setErrorMessage("This member is already in the chat.");
      } else {
        setErrorMessage("Unable to add member.");
      }
    },
  });

  const navItems: NavItem[] = [
    { kind: "page", name: "Account", link: "/account" },
    {
      kind: "chat",
      name: "Chats",
      link: "/chats",
      active: true,
      chats: chats.map((chat) => ({
        name: chat.name,
        link: `/chats/${chat.id}`,
        active: chat.id === parsedChatId,
      })),
    },
  ];

  const canSave =
    isOwner &&
    selectedChat !== undefined &&
    chatName.trim().length > 0 &&
    chatName.trim() !== selectedChat.name &&
    !updateChatMutation.isPending;

  const canRemoveMember = (memberId: number) => {
    if (!account || !selectedChat) {
      return false;
    }

    if (account.id === selectedChat.ownerId) {
      return account.id !== memberId;
    }

    return account.id === memberId;
  };

  const handleAddMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addMemberUsername.trim()) {
      setErrorMessage("Please enter a username.");
      return;
    }

    const userToAdd = allAccounts.find(
      (a) => a.username.toLowerCase() === addMemberUsername.toLowerCase(),
    );

    if (!userToAdd) {
      setErrorMessage("User not found.");
      return;
    }

    if (members.some((m) => m.id === userToAdd.id)) {
      setErrorMessage("This user is already a member of the chat.");
      return;
    }

    addMemberMutation.mutate(userToAdd.id);
  };

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (!selectedChat) {
          return a.username.localeCompare(b.username);
        }

        if (a.id === selectedChat.ownerId) {
          return -1;
        }

        if (b.id === selectedChat.ownerId) {
          return 1;
        }

        return a.username.localeCompare(b.username);
      }),
    [members, selectedChat],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) {
      return;
    }

    setSuccessMessage("");
    updateChatMutation.mutate(chatName.trim());
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={navItems} />

      <main className="flex-1 p-8 min-w-0">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold">
              {selectedChat?.name ?? `Chat ${chatId}`} settings
            </h1>
            <Link to="/chats/$chatId" params={{ chatId }} className="text-blue-700 underline">
              Back to chat
            </Link>
          </div>

          {!hasValidChatId || !selectedChat
            ? (
              <section className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
                <p className="text-gray-700">Chat {chatId} does not exist.</p>
              </section>
            )
            : membersLoading
            ? (
              <section className="p-6 border rounded-lg bg-white shadow-sm">
                <p className="text-gray-700">Loading chat settings...</p>
              </section>
            )
            : membersError
            ? (
              <section className="p-6 border rounded-lg bg-white shadow-sm">
                <p className="text-red-700">Unable to load chat settings.</p>
              </section>
            )
            : !isMember
            ? (
              <section className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Access restricted</h2>
                <p className="text-gray-700">
                  You must be a member of this chat to view settings.
                </p>
              </section>
            )
            : (
              <>
                <section className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                  <h2 className="text-xl font-semibold">Update chat name</h2>

                  <ErrorMessage message={errorMessage} />
                  <SuccessMessage message={successMessage} />
                  <SuccessMessage message={actionMessage} />

                  {isOwner
                    ? (
                      <form className="flex gap-2" onSubmit={handleSubmit}>
                        <input
                          type="text"
                          className="flex-1 border rounded-md px-3 py-2"
                          value={chatName}
                          onChange={(event) => setChatName(event.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={!canSave}
                          className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
                        >
                          {updateChatMutation.isPending ? "Saving..." : "Save"}
                        </button>
                      </form>
                    )
                    : (
                      <p className="text-sm text-gray-600">
                        Only the chat owner can update the chat name.
                      </p>
                    )}
                </section>

                <section className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                  <h2 className="text-xl font-semibold">Chat members</h2>

                  {isOwner
                    ? (
                      <form className="flex gap-2" onSubmit={handleAddMember}>
                        <input
                          type="text"
                          placeholder="Enter username to add"
                          className="flex-1 border rounded-md px-3 py-2"
                          value={addMemberUsername}
                          onChange={(event) => setAddMemberUsername(event.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={addMemberMutation.isPending}
                          className="inline-flex items-center rounded-md bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700"
                        >
                          {addMemberMutation.isPending ? "Adding..." : "Add"}
                        </button>
                      </form>
                    )
                    : null}

                  {isOwner
                    ? (
                      <ul className="divide-y border rounded-md">
                        {sortedMembers.map((member) => (
                          <li
                            key={member.id}
                            className="px-4 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.username}</p>
                              {selectedChat.ownerId === member.id
                                ? (
                                  <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
                                    owner
                                  </span>
                                )
                                : null}
                            </div>
                            {canRemoveMember(member.id)
                              ? (
                                <button
                                  type="button"
                                  disabled={removeMemberMutation.isPending}
                                  className="inline-flex items-center rounded-md border border-red-300 text-red-700 px-3 py-1 font-medium hover:bg-red-50"
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                >
                                  Remove
                                </button>
                              )
                              : null}
                          </li>
                        ))}
                      </ul>
                    )
                    : (
                      <ul className="divide-y border rounded-md">
                        {sortedMembers.map((member) => (
                          <li
                            key={member.id}
                            className="px-4 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.username}</p>
                              {selectedChat.ownerId === member.id
                                ? (
                                  <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
                                    owner
                                  </span>
                                )
                                : null}
                            </div>
                            {canRemoveMember(member.id)
                              ? (
                                <button
                                  type="button"
                                  disabled={removeMemberMutation.isPending}
                                  className="inline-flex items-center rounded-md border border-red-300 text-red-700 px-3 py-1 font-medium hover:bg-red-50"
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                >
                                  Remove
                                </button>
                              )
                              : null}
                          </li>
                        ))}
                      </ul>
                    )}
                </section>
              </>
            )}
        </div>
      </main>
    </div>
  );
}
