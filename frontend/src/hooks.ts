import { useQuery } from "@tanstack/react-query";
import {
  chatMembersQuery,
  chatMessagesQuery,
  chatMessagesWithAccountsQuery,
  chatsQuery,
} from "./query.ts";
import type { AccountSort, ChatSort } from "./types.ts";

export function useChats(sort: ChatSort = "id") {
  return useQuery(chatsQuery(sort));
}

export function useChatMessages(chatId: number) {
  return useQuery(chatMessagesQuery(chatId));
}

export function useChatMembers(chatId: number, sort: AccountSort = "id") {
  return useQuery(chatMembersQuery(chatId, sort));
}

export function useChatMessagesWithAccounts(chatId: number) {
  return useQuery(chatMessagesWithAccountsQuery(chatId));
}
