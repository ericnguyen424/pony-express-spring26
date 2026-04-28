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
  CreateChatRequest,
  CreateMessageRequest,
  LoginRequest,
  LoginResponse,
  Message,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateAccountRequest,
  UpdateChatRequest,
  UpdateMessageRequest,
  UpdatePasswordRequest,
} from "./types.ts";

const baseUrl = "http://127.0.0.1:8000";

function getStoredAccessToken(): string | undefined {
  if (typeof localStorage === "undefined") {
    return undefined;
  }

  const storedAuth = localStorage.getItem("pony_express_auth");
  if (!storedAuth) {
    return undefined;
  }

  try {
    const parsedAuth = JSON.parse(storedAuth) as { token?: unknown };
    return typeof parsedAuth.token === "string" ? parsedAuth.token : undefined;
  } catch {
    return undefined;
  }
}

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

function authHeaders(token?: string): HeadersInit {
  const accessToken = token ?? getStoredAccessToken();

  if (!accessToken) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

function toFormData(payload: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    formData.append(key, value);
  }

  return formData;
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
  const response = await fetch(`${baseUrl}/chats${toQueryString({ sort })}`, {
    headers: authHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiChatsResponse;
  return data.chats.map(toChat);
}

export async function createChat(
  createRequest: CreateChatRequest,
  token?: string,
): Promise<Chat> {
  const response = await fetch(`${baseUrl}/chats`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify(createRequest),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiChat;
  return toChat(data);
}

export async function updateChat(
  chatId: number,
  updateRequest: UpdateChatRequest,
  token?: string,
): Promise<Chat> {
  const response = await fetch(`${baseUrl}/chats/${chatId}`, {
    method: "PUT",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify(updateRequest),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiChat;
  return toChat(data);
}

export async function fetchChatMessages(chatId: number): Promise<Message[]> {
  const response = await fetch(`${baseUrl}/chats/${chatId}/messages`, {
    headers: authHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiMessagesResponse;
  return data.messages.map(toMessage);
}

export async function createChatMessage(
  chatId: number,
  createRequest: CreateMessageRequest,
  token?: string,
): Promise<Message> {
  const response = await fetch(`${baseUrl}/chats/${chatId}/messages`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify(createRequest),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiMessage;
  return toMessage(data);
}

export async function updateChatMessage(
  chatId: number,
  messageId: number,
  updateRequest: UpdateMessageRequest,
  token?: string,
): Promise<Message> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/messages${toQueryString({ message_id: messageId })}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      credentials: "include",
      body: JSON.stringify(updateRequest),
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiMessage;
  return toMessage(data);
}

export async function deleteChatMessage(
  chatId: number,
  messageId: number,
  token?: string,
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/messages${toQueryString({ message_id: messageId })}`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }
}

export async function deleteChatMembership(
  chatId: number,
  accountId: number,
  token?: string,
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/accounts${toQueryString({ account_id: accountId })}`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }
}

export async function addChatMembership(
  chatId: number,
  accountId: number,
  token?: string,
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/accounts${toQueryString({ account_id: accountId })}`,
    {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }
}

export async function fetchChatMembers(
  chatId: number,
  sort: AccountSort = "id",
): Promise<Account[]> {
  const response = await fetch(
    `${baseUrl}/chats/${chatId}/accounts${toQueryString({ sort })}`,
    {
      headers: authHeaders(),
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiAccountsResponse;
  return data.accounts.map(toAccount);
}

export async function fetchAllAccounts(
  sort: AccountSort = "id",
): Promise<Account[]> {
  const response = await fetch(
    `${baseUrl}/accounts${toQueryString({ sort })}`,
    {
      headers: authHeaders(),
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleApiError(response);
  }

  const data = await response.json() as ApiAccountsResponse;
  return data.accounts.map(toAccount);
}

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/auth/tokens`, {
    method: "POST",
    body: toFormData({
      username: loginRequest.username,
      password: loginRequest.password,
    }),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return await response.json() as LoginResponse;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/logins`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleApiError(response);
  }
}

export async function register(
  registerRequest: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await fetch(`${baseUrl}/auth/registrations`, {
    method: "POST",
    body: toFormData({
      username: registerRequest.username,
      email: registerRequest.email,
      password: registerRequest.password,
    }),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return await response.json() as RegisterResponse;
}

export async function fetchAccountMe(token?: string): Promise<Account> {
  const response = await fetch(`${baseUrl}/accounts/me`, {
    method: "GET",
    headers: authHeaders(token),
    credentials: "include",
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const account = await response.json() as MeResponse;
  return {
    id: account.id,
    username: account.username,
    email: account.email,
  };
}

export async function updateAccount(
  update: UpdateAccountRequest,
  token?: string,
): Promise<Account> {
  const response = await fetch(`${baseUrl}/accounts/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  const account = await response.json() as MeResponse;
  return {
    id: account.id,
    username: account.username,
    email: account.email,
  };
}

export async function updateAccountPassword(
  update: UpdatePasswordRequest,
  token?: string,
): Promise<void> {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${baseUrl}/accounts/me/password`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: toFormData({
      old_password: update.old_password,
      new_password: update.new_password,
    }),
  });

  if (!response.ok) {
    return handleApiError(response);
  }
}
