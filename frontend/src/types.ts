export type ChatSort = "id" | "name";
export type AccountSort = "id" | "username";

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	access_token?: string;
	token_type?: string;
}

export interface RegisterResponse {
	id: number;
	username: string;
	email: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface UpdateAccountRequest {
	username?: string;
	email?: string;
}

export interface UpdatePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface CreateChatRequest {
	name: string;
	owner_id: number;
}

export interface UpdateChatRequest {
	name: string;
	owner_id: number;
}

export interface CreateMessageRequest {
	text: string;
	account_id: number;
	chat_id: number;
	created_at: string;
}

export interface UpdateMessageRequest {
	text: string;
	account_id: number;
	chat_id: number;
	owner_id: number;
}

export interface MeResponse {
	id: number;
	username: string;
	email: string;
}

export interface ApiCollectionMetadata {
	count: number;
	sort: string;
}

export interface ApiChat {
	id: number;
	name: string;
	owner_id: number;
}

export interface ApiChatsResponse {
	metadata: ApiCollectionMetadata;
	chats: ApiChat[];
}

export interface ApiMessage {
	id: number;
	text: string;
	account_id: number;
	chat_id: number;
	created_at: string;
}

export interface ApiMessagesResponse {
	metadata: ApiCollectionMetadata;
	messages: ApiMessage[];
}

export interface ApiAccount {
	id: number;
	username: string;
}

export interface ApiAccountsResponse {
	metadata: ApiCollectionMetadata;
	accounts: ApiAccount[];
}

export interface Chat {
	id: number;
	name: string;
	ownerId: number;
}

export interface Account {
	id: number;
	username: string;
	email?: string;
}

export interface Message {
	id: number;
	text: string;
	accountId: number;
	chatId: number;
	timestamp: Date;
}

export interface MessageWithAccount {
	id: number;
	text: string;
	accountId: number;
	chatId: number;
	account: Account | null;
	timestamp: Date;
}

