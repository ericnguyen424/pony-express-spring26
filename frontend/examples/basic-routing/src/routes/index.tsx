import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center">home</h1>
      <p>This is the main page</p>
    </>
  );
}
