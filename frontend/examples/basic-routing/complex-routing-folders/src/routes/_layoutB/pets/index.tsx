import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutB/pets/")({
  component: IndexComponent,
});

function IndexComponent() {
  return <p>choose a pet</p>;
}
