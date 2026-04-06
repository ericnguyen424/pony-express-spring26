import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/account_password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/account/account_password"!</div>
}
