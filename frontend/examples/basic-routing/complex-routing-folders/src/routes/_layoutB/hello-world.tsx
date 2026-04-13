import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Section from "../../components/Section.tsx";
import Heading from "../../components/Heading.tsx";

export const Route = createFileRoute("/_layoutB/hello-world")({
  component: HelloWorld,
});

function HelloWorld() {
  const [excitement, setExcitement] = useState<number>(0);

  const incExcitement = () => setExcitement(excitement + 1);
  const decExcitement = () => setExcitement(excitement - 1);
  const resetExcitement = () => setExcitement(0);

  const punctuation = excitement >= 0
    ? "!".repeat(excitement)
    : ".".repeat(-excitement);

  return (
    <Section id="hello-world">
      <Heading>
        hello, world + {punctuation}
      </Heading>
      <div
        id="button-grid"
        className="grid grid-cols-3 gap-8 max-w-3xs mx-auto"
      >
        <button type="button" onClick={incExcitement} className="border p-1">
          :)
        </button>

        <button type="button" onClick={resetExcitement} className="border p-1">
          :|
        </button>

        <button type="button" onClick={decExcitement} className="border p-1">
          :(
        </button>
      </div>
    </Section>
  );
}
