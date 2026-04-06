import { createFileRoute } from '@tanstack/react-router'
import { getChats, getMessagesForChat } from '../../api'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/chats/$chatId')({
  component: ChatDetails,
})

function ChatDetails() {
  const { chatId } = Route.useParams()

  const chatLinks = getChats().map((chat) => ({
    name: chat.name,
    link: `/chats/${chat.id}`,
  }))

  if (!chatLinks.some((chat) => chat.link === `/chats/${chatId}`)) {
    chatLinks.push({ name: chatId, link: `/chats/${chatId}` })
  }

  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account' },
    {
      kind: 'chat',
      name: 'Chats',
      link: '/chats',
      active: true,
      chats: chatLinks.map((chat) => ({
        ...chat,
        active: chat.link === `/chats/${chatId}`,
      })),
    },
  ]

  const messages = getMessagesForChat(chatId)

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
