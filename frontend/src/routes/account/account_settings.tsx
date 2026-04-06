import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/account_settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/account/account_settings"!</div>
}
