import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center">about</h1>
      <p>This is a react application with some basic routing</p>
    </>
  );
}
