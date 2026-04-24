import type {
  Account,
  AccountSort,
  ApiAccount,
  ApiAccountsResponse,
  ApiChat,
  ApiChatsResponse,
  ApiMessage,
  ApiMessagesResponse,
  Chat,
  ChatSort,
  Message,
} from "./types.ts";

const baseUrl = "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseErrorPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

export async function handleApiError(response: Response): Promise<never> {
  const payload = await parseErrorPayload(response);

  const detail =
    typeof payload === "object" && payload !== null && "detail" in payload
      ? (payload as { detail?: unknown }).detail
      : undefined;

  const detailMessage = typeof detail === "string"
    ? detail
    : `HTTP ${response.status}`;

  throw new ApiError(detailMessage, response.status, payload);
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query.length > 0 ? `?${query}` : "";
}

function toChat(chat: ApiChat): Chat {
  return {
    id: chat.id,
    name: chat.name,
    ownerId: chat.owner_id,
  };
}

function toMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    text: message.text,
    accountId: message.account_id,
    chatId: message.chat_id,
    timestamp: new Date(message.created_at),
  };
}

function toAccount(account: ApiAccount): Account {
  return {
    id: account.id,
    username: account.username,
  };
}

export async function fetchChats(sort: ChatSort = "id"): Promise<Chat[]> {
  const response = await fetch(`${baseUrl}/chats${toQueryString({ sort })}`);

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiChatsResponse;
  return data.chats.map(toChat);
}

export async function fetchChatMessages(chatId: number): Promise<Message[]> {
  const response = await fetch(`${baseUrl}/chats/${chatId}/messages`);

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiMessagesResponse;
  return data.messages.map(toMessage);
}

export async function fetchChatMembers(
  chatId: number,
  sort: AccountSort = "id",
): Promise<Account[]> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/accounts${toQueryString({ sort })}`,
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiAccountsResponse;
  return data.accounts.map(toAccount);
}
