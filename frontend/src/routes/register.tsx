import { createFileRoute } from '@tanstack/react-router'
import NavBar, { type NavItem } from "../../components/navbar";

export const Route = createFileRoute('/register')({
  component: Register,
})

function Register() {
  const items: NavItem[] = [
    { kind: "page", name: "Login", link: "/login" },
    { kind: "page", name: "Register", link: "/register", active: true },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8">
        <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-6">Register</h1>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        </div>
      </main>
    </div>
  );
}
