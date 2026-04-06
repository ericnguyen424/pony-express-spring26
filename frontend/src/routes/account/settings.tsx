import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/account/settings')({
  component: AccountSettings,
})

function AccountSettings() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account', active: true },
    { kind: 'chat', chats: [] },
  ]

  return (
    <>
      <NavBar items={items}></NavBar>
      <main className="max-w-md mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </form>
      </main>
    </>
  )
}
