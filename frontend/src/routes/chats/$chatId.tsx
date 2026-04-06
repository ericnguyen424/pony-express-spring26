import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

type ChatMessage = {
  id: string
  account_id: number | null
  username: string | null
  created_at: string
  text: string
}

export const Route = createFileRoute('/chats/$chatId')({
  component: ChatDetails,
})

function ChatDetails() {
  const { chatId } = Route.useParams()

  const chatLinks = [
    { name: 'General', link: '/chats/general' },
    { name: 'Project', link: '/chats/project' },
  ]

  if (!chatLinks.some((chat) => chat.link === `/chats/${chatId}`)) {
    chatLinks.push({ name: chatId, link: `/chats/${chatId}` })
  }

  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account' },
    { kind: 'page', name: 'Chats', link: '/chats' },
    {
      kind: 'chat',
      chats: chatLinks.map((chat) => ({
        ...chat,
        active: chat.link === `/chats/${chatId}`,
      })),
    },
  ]

  const messages: ChatMessage[] = [
    {
      id: 'm1',
      account_id: 1,
      username: 'eric',
      created_at: '2026-04-05T09:00:00.000Z',
      text: 'Good morning everyone!',
    },
    {
      id: 'm2',
      account_id: null,
      username: null,
      created_at: '2026-04-05T09:03:00.000Z',
      text: 'This message is from a removed account.',
    },
    {
      id: 'm3',
      account_id: 2,
      username: 'jordan',
      created_at: '2026-04-05T09:05:00.000Z',
      text: 'Let’s sync up after standup.',
    },
    {
      id: 'm4',
      account_id: 1,
      username: 'eric',
      created_at: '2026-04-05T09:08:00.000Z',
      text: 'Sounds good to me.',
    },
  ]

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8 min-w-0">
        <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Chat: {chatId}</h1>

        <section className="border rounded-lg bg-white shadow-sm h-[calc(100vh-10rem)] overflow-y-auto">
          <ul className="divide-y">
            {sortedMessages.map((message) => (
              <li key={message.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">
                    {message.account_id === null ? '[removed]' : message.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
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
