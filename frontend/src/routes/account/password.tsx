import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import type { RouterContext } from "../../router.ts";
import { updateAccountPassword } from "../../api.ts";
import { useAuth } from "../../hooks.ts";
import { ErrorMessage, SuccessMessage } from "../../../components/messages.tsx";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";

export const Route = createFileRoute("/account/password")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: AccountPassword,
});

function AccountPassword() {
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordsDoNotMatch =
    newPassword.length > 0 &&
    confirmNewPassword.length > 0 &&
    newPassword !== confirmNewPassword;

  const updatePasswordMutation = useMutation({
    mutationFn: () =>
      updateAccountPassword(
        { old_password: oldPassword, new_password: newPassword },
        token ?? undefined,
      ),
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Password updated.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: () => {
      setSuccessMessage("");
      setErrorMessage("Unable to update password.");
    },
  });

  const canSubmit =
    oldPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmNewPassword.length > 0 &&
    !passwordsDoNotMatch;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || updatePasswordMutation.isPending) {
      return;
    }

    updatePasswordMutation.mutate();
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
          <h1 className="text-3xl font-bold mb-6">Update Password</h1>

          <form
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
            onSubmit={handleSubmit}
          >
            <ErrorMessage
              message={passwordsDoNotMatch
                ? "Passwords do not match."
                : errorMessage}
            />
            <SuccessMessage message={successMessage} />

            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium mb-1"
              >
                Current password
              </label>
              <input
                id="current-password"
                name="current-password"
                type="password"
                className="w-full border rounded-md px-3 py-2"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium mb-1"
              >
                New password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                className="w-full border rounded-md px-3 py-2"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium mb-1"
              >
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type="password"
                className="w-full border rounded-md px-3 py-2"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || updatePasswordMutation.isPending}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {updatePasswordMutation.isPending
                ? "Updating password..."
                : "Update password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
