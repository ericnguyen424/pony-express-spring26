import { createFileRoute } from '@tanstack/react-router'
import { getChats } from '../../api'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/chat/chats')({
  component: Chats,
})

function Chats() {
  const chats = getChats()

  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account' },
    {
      kind: 'chat',
      name: 'Chats',
      link: '/chat/chats',
      active: true,
      chats: chats.map((chat) => ({
        name: chat.name,
        link: `/chat/${chat.id}`,
      })),
    },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>
      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Chats</h1>
          <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
            <div>
              <label htmlFor="chat-name" className="block text-sm font-medium mb-1">Chat name</label>
              <input id="chat-name" type="text" className="w-full border rounded-md px-3 py-2" />
            </div>
            <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700">
              Start a new chat
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
