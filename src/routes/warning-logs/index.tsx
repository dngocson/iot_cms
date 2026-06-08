import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/warning-logs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/warning-logs/"!</div>
}
