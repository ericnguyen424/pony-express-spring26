import { queryOptions } from "@tanstack/react-query";
import {
  fetchAccountMe,
  fetchChatMembers,
  fetchChatMessages,
  fetchChats,
} from "./api.ts";
import type { AccountSort, ChatSort, MessageWithAccount } from "./types.ts";

export const chatsQuery = (sort: ChatSort = "id") =>
  queryOptions({
    queryKey: ["chats", sort],
    queryFn: () => fetchChats(sort),
    staleTime: 15_000,
  });

export const chatMessagesQuery = (chatId: number) =>
  queryOptions({
    queryKey: ["chats", chatId, "messages"],
    queryFn: () => fetchChatMessages(chatId),
    retry: 0,
  });

export const chatMembersQuery = (chatId: number, sort: AccountSort = "id") =>
  queryOptions({
    queryKey: ["chats", chatId, "members", sort],
    queryFn: () => fetchChatMembers(chatId, sort),
    retry: 0,
    placeholderData: [],
  });

export const chatMessagesWithAccountsQuery = (chatId: number) =>
  queryOptions({
    queryKey: ["chats", chatId, "messages-with-accounts"],
    queryFn: async (): Promise<MessageWithAccount[]> => {
      const [messages, members] = await Promise.all([
        fetchChatMessages(chatId),
        fetchChatMembers(chatId),
      ]);

      const accountById = new Map(members.map((member) => [member.id, member]));

      return messages.map((message) => ({
        id: message.id,
        text: message.text,
        accountId: message.accountId,
        chatId: message.chatId,
        account: accountById.get(message.accountId) ?? null,
        timestamp: message.timestamp,
      }));
    },
    retry: 0,
  });

export const accountMeQuery = (token?: string) =>
  queryOptions({
    queryKey: ["accounts", "me", token ?? "cookie"],
    queryFn: () => fetchAccountMe(token),
    retry: 0,
  });
