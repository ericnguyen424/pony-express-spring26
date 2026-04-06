import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: Faq,
});

function Faq() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center">
        frequently asked questions
      </h1>
      <section id="question" className="flex flex-col space-y-2 py-4">
        <details className="border p-2">
          <summary className="font-semibold">
            Which routes are available?
          </summary>
          <p>There are 3 routes</p>
          <ul className="list-disc ml-8">
            <li>The home route at "/"</li>
            <li>The about route at "/about"</li>
            <li>The FAQ route at "/faq"</li>
          </ul>
        </details>
        <details className="border p-2">
          <summary className="font-semibold">What is always rendered?</summary>
          <p>
            Whatever is specified in "routes/__root.tsx" will always be rendered
          </p>
          <ul className="list-disc ml-8">
            <li>A {"<nav>"} tag with three links</li>
            <li>A {"<main>"} tag with an Outlet component</li>
          </ul>
        </details>
        <details className="border p-2">
          <summary className="font-semibold">
            How does the Outlet component work?
          </summary>
          <p>
            The Outlet component is used to render the next potentially matching
            child route.
          </p>
          <ul className="list-disc ml-8">
            <li>It takes no props, i.e., {"<Outlet />"}</li>
            <li>If there is no matching route, renders "null"</li>
            <li>If there is a matching child route, renders its component</li>
          </ul>
        </details>
      </section>
    </>
  );
}
