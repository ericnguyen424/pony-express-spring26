import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import type { RouterContext } from "../router.ts";
import { ApiError } from "../api.ts";
import { login as loginApi, register as registerApi } from "../api.ts";
import { ErrorMessage } from "../../components/messages.tsx";
import { useAuth } from "../hooks.ts";
import NavBar, { type NavItem } from "../../components/navbar.tsx";

export const Route = createFileRoute("/register")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (routerContext.auth?.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  component: Register,
});

function Register() {
  const navigate = Route.useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toRegisterErrorMessage = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return "Unable to create account.";
    }

    if (error.status === 422) {
      const details = error.details;

      if (
        typeof details === "object" &&
        details !== null &&
        "error" in details &&
        (details as { error?: unknown }).error === "value_not_allowed"
      ) {
        return "Username or email already exists.";
      }

      return "Invalid registration values.";
    }

    return "Unable to create account.";
  };

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onError: (error) => {
      setErrorMessage(toRegisterErrorMessage(error));
    },
  });

  const tokenMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (!data.access_token) {
        setErrorMessage("Unable to log in new account.");
        return;
      }

      login(data.access_token);
      setErrorMessage("");
      navigate({ to: "/" });
    },
    onError: () => {
      setErrorMessage("Unable to log in new account.");
    },
  });

  const passwordsDoNotMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !passwordsDoNotMatch;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || registerMutation.isPending || tokenMutation.isPending) {
      return;
    }

    setErrorMessage("");
    try {
      await registerMutation.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      await tokenMutation.mutateAsync({
        username: username.trim(),
        password,
      });
    } catch {
      // errors are handled in mutation callbacks
    }
  };

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

          <form
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
            onSubmit={handleSubmit}
          >
            <ErrorMessage
              message={passwordsDoNotMatch
                ? "Passwords do not match."
                : errorMessage}
            />

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
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full border rounded-md px-3 py-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium mb-1"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                className="w-full border rounded-md px-3 py-2"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || registerMutation.isPending || tokenMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {registerMutation.isPending || tokenMutation.isPending
                ? "Registering..."
                : "Register"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
