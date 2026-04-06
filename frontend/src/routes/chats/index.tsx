import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/chats/')({
  component: Chats,
})

function Chats() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account' },
    { kind: 'page', name: 'Chats', link: '/chats', active: true },
    {
      kind: 'chat',
      chats: [
        { name: 'General', link: '/chats/general' },
        { name: 'Project', link: '/chats/project' },
      ],
    },
  ]

  return (
    <>
      <NavBar items={items}></NavBar>

      <main className="max-w-md mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Chats</h1>

        <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
          <div>
            <label htmlFor="chat-name" className="block text-sm font-medium mb-1">
              Chat name
            </label>
            <input
              id="chat-name"
              name="chat-name"
              type="text"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
          >
            Start a new chat
          </button>
        </form>
      </main>
    </>
  )
}
