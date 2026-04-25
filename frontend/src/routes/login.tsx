import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import type { RouterContext } from "../router.ts";
import { login as loginApi } from "../api.ts";
import { ErrorMessage } from "../../components/messages.tsx";
import { useAuth } from "../hooks.ts";
import NavBar, { type NavItem } from "../../components/navbar.tsx";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (routerContext.auth?.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  component: Login,
});

function Login() {
  const navigate = Route.useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (!data.access_token) {
        setErrorMessage("Invalid username or password.");
        return;
      }

      login(data.access_token);
      setErrorMessage("");
      navigate({ to: "/" });
    },
    onError: () => {
      setErrorMessage("Invalid username or password.");
    },
  });

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) {
      return;
    }

    loginMutation.mutate({ username: username.trim(), password });
  };

  const items: NavItem[] = [
    { kind: "page", name: "Login", link: "/login", active: true },
    { kind: "page", name: "Register", link: "/register" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Login</h1>

          <form
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
            onSubmit={handleSubmit}
          >
            <ErrorMessage message={errorMessage} />

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full border rounded-md px-3 py-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loginMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
