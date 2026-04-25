import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RouterContext } from "../../router.ts";
import { updateAccount } from "../../api.ts";
import { useAccount, useAuth } from "../../hooks.ts";
import { ErrorMessage, SuccessMessage } from "../../../components/messages.tsx";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";

export const Route = createFileRoute("/account/settings")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: AccountSettings,
});

function AccountSettings() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const {
    data: account,
    isPending,
    isError,
  } = useAccount();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (account) {
      setUsername(account.username ?? "");
      setEmail(account.email ?? "");
    }
  }, [account]);

  const updateMutation = useMutation({
    mutationFn: (payload: { username: string; email: string }) =>
      updateAccount(payload, token ?? undefined),
    onSuccess: async () => {
      setErrorMessage("");
      setSuccessMessage("Account updated.");
      await queryClient.invalidateQueries({ queryKey: ["accounts", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: () => {
      setSuccessMessage("");
      setErrorMessage("Username or email already exists.");
    },
  });

  const canSubmit = username.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || updateMutation.isPending) {
      return;
    }

    updateMutation.mutate({
      username: username.trim(),
      email: email.trim(),
    });
  };

  const items: NavItem[] = [
    { kind: "page", name: "Account", link: "/account", active: true },
    { kind: "chat", name: "Chats", link: "/chats", chats: [] },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>
      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <form
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
            onSubmit={handleSubmit}
          >
            {isPending
              ? <p className="text-sm text-gray-600">Loading account...</p>
              : null}

            {isError
              ? <ErrorMessage message="Unable to load account." />
              : null}

            <ErrorMessage message={errorMessage} />
            <SuccessMessage message={successMessage} />

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
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || updateMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
