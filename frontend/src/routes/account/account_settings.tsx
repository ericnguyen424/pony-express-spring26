import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/account/account_settings')({
  component: AccountSettings,
})

function AccountSettings() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account', active: true },
    { kind: 'page', name: 'Chats', link: '/chats' },
    { kind: 'chat', chats: [] },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>
      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
              <input id="username" type="text" className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="text" className="w-full border rounded-md px-3 py-2" />
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
