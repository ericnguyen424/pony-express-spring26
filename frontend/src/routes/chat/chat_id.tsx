import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

type ChatMessage = {
  id: string
  account_id: number | null
  username: string | null
  created_at: string
  text: string
}

export const Route = createFileRoute('/chat/chat_id')({
  component: ChatDetail,
})

function ChatDetail() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account' },
    { kind: 'page', name: 'Chats', link: '/chat/chats' },
    {
      kind: 'chat',
      chats: [{ name: 'Chat', link: '/chat/chat_id', active: true }],
    },
  ]

  const messages: ChatMessage[] = [
    { id: '1', account_id: 11, username: 'alex', created_at: '2026-04-05T09:00:00.000Z', text: 'Welcome to the chat.' },
    { id: '2', account_id: null, username: null, created_at: '2026-04-05T09:04:00.000Z', text: 'This account was removed.' },
    { id: '3', account_id: 12, username: 'sam', created_at: '2026-04-05T09:06:00.000Z', text: 'Thanks for the update.' },
  ]

  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>
      <main className="flex-1 p-8 min-w-0">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Chat</h1>
          <section className="border rounded-lg bg-white shadow-sm h-[calc(100vh-10rem)] overflow-y-auto">
            <ul className="divide-y">
              {sorted.map((message) => (
                <li key={message.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{message.account_id === null ? '[removed]' : message.username}</p>
                    <p className="text-sm text-gray-600">{new Date(message.created_at).toLocaleString()}</p>
                  </div>
                  <p>{message.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
