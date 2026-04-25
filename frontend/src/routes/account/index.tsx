import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import type { RouterContext } from "../../router.ts";
import { logout as logoutApi } from "../../api.ts";
import { useAccount, useAuth } from "../../hooks.ts";
import { ErrorMessage } from "../../../components/messages.tsx";
import NavBar, { type NavItem } from "../../../components/navbar.tsx";

export const Route = createFileRoute("/account/")({
  beforeLoad: async ({ context }) => {
    const routerContext = context as RouterContext;
    if (!routerContext.auth?.loggedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: Account,
});

function Account() {
  const navigate = Route.useNavigate();
  const { logout } = useAuth();
  const {
    data: account,
    isPending,
    isError,
  } = useAccount();

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
      navigate({ to: "/login" });
    },
  });

  const items: NavItem[] = [
    { kind: "page", name: "Account", link: "/account", active: true },
    { kind: "chat", name: "Chats", link: "/chats", chats: [] },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavBar items={items}></NavBar>

      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Account</h1>

          <section className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
            {isPending
              ? <p className="text-sm text-gray-600">Loading account...</p>
              : null}

            {isError
              ? <ErrorMessage message="Unable to load account." />
              : null}

            {!isPending && !isError && account
              ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-medium">{account.username}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{account.email ?? ""}</p>
                  </div>
                </>
              )
              : null}

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
              onClick={() => logoutMutation.mutate()}
              className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
