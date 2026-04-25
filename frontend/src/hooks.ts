import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import {
  chatMembersQuery,
  chatMessagesQuery,
  chatMessagesWithAccountsQuery,
  chatsQuery,
} from "./query.ts";
import type { AccountSort, ChatSort } from "./types.ts";
import { AuthContext } from "./contexts/auth.tsx";

export function useAuth() {
  return useContext(AuthContext);
}

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
