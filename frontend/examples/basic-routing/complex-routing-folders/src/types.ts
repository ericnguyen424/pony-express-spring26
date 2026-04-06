interface Metadata {
  count: number;
  sort: string;
}

export interface Account {
  id: number;
  username: string;
}

export interface AccountCollection {
  metadata: Metadata;
  accounts: Account[];
}

export interface Chat {
  id: number;
  name: string;
}

export interface ChatCollection {
  metadata: Metadata;
  chats: Chat[];
}

export interface ChatMessages {
  messages: Message[];
}

export interface ApiMessage {
  id: number;
  text: string;
  account_id: number;
  created_at: Date;
}

export interface Message {
  id: number;
  text: string;
  account: Account;
  timestamp: Date;
}

export interface MessageCollection {
  metadata: Metadata;
  messages: ApiMessage[];
}
