import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/account/')({
  component: Account,
})

function Account() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account', active: true },
    { kind: 'chat', name: 'Chats', link: '/chats', chats: [] },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8">
        <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-6">Account</h1>

        <section className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-medium">pony_rider</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">pony.rider@example.com</p>
          </div>

          <div className="flex flex-col gap-2">
            <a href="/account/settings" className="text-blue-700 underline">
              Settings
            </a>
            <a href="/account/password" className="text-blue-700 underline">
              Update Password
            </a>
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
          >
            Logout
          </button>
        </section>
        </div>
      </main>
    </div>
  )
}
