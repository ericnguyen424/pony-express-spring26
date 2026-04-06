import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from '../../../components/navbar'

export const Route = createFileRoute('/account/password')({
  component: AccountPassword,
})

function AccountPassword() {
  const items: NavItem[] = [
    { kind: 'page', name: 'Account', link: '/account', active: true },
    { kind: 'chat', chats: [] },
  ]

  return (
    <>
      <NavBar items={items}></NavBar>
      <main className="max-w-md mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Update Password</h1>

        <form className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium mb-1">
              Current password
            </label>
            <input
              id="current-password"
              name="current-password"
              type="password"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
          >
            Update password
          </button>
        </form>
      </main>
    </>
  )
}
