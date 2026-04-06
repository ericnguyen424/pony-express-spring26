import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/account/account')({
  component: Account,
})

function Account() {
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
          </section>
        </div>
      </main>
    </div>
  )
}
