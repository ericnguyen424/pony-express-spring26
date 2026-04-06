import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat/chat_id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/chat/chat_id"!</div>
}
