export type ChatSummary = {
  id: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  account_id: number | null;
  username: string | null;
  created_at: string;
  text: string;
};

const chats: ChatSummary[] = [
  { id: "general", name: "General" },
  { id: "project", name: "Project" },
];

const messagesByChatId: Record<string, ChatMessage[]> = {
  general: [
    {
      id: "m1",
      account_id: 1,
      username: "eric",
      created_at: "2026-04-05T09:00:00.000Z",
      text: "Good morning everyone!",
    },
    {
      id: "m2",
      account_id: null,
      username: null,
      created_at: "2026-04-05T09:03:00.000Z",
      text: "This message is from a removed account.",
    },
    {
      id: "m3",
      account_id: 2,
      username: "jordan",
      created_at: "2026-04-05T09:05:00.000Z",
      text: "Let’s sync up after standup.",
    },
  ],
  project: [
    {
      id: "m4",
      account_id: 1,
      username: "eric",
      created_at: "2026-04-05T10:00:00.000Z",
      text: "Project kickoff is at 2 PM.",
    },
    {
      id: "m5",
      account_id: 2,
      username: "sam",
      created_at: "2026-04-05T10:06:00.000Z",
      text: "I’ll bring the notes.",
    },
    {
      id: "m6",
      account_id: null,
      username: null,
      created_at: "2026-04-05T10:12:00.000Z",
      text: "This account was removed.",
    },
  ],
};

export function getChats(): ChatSummary[] {
  return chats;
}

export function getMessagesForChat(chatId: string): ChatMessage[] {
  return messagesByChatId[chatId] ?? [];
}
