import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/water-meter/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/water-meter/"!</div>
}
